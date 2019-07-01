// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Culture } from '@microsoft/recognizers-text-date-time';
import { ActivityHandler, BotHandler, RecognizerResult } from 'botbuilder';
import { LuisRecognizer } from 'botbuilder-ai';
import moment from 'moment';

import { createConditionsRequest, createWeatherRequest, getFeatureLabel, WeatherConditionsRequest, WeatherRequest } from './entities';
import { I18NFunction, TurnContextI18N } from './helpers/i18n-bot-middleware';
import { WeatherIntent } from './luis-model';
import { WeatherCondition, WeatherValue } from './weather-conditions';
import { WeatherForecast } from './weather-forecast';
import { getUnitsFor } from './weather-units';

export class WeatherBot extends ActivityHandler {

  constructor(private recognizer: LuisRecognizer, private weather: WeatherForecast) {
    super();
    this.onMessage(this.message.bind(this));
  }

  private message: BotHandler = async (context: TurnContextI18N) => {
    const recognized = await this.recognizer.recognize(context);
    if (context.activity && context.activity.text) {
      context.activity.text = context.activity.text.replace(/^hey jio /i, '');
    }
    const intent = LuisRecognizer.topIntent(recognized) as WeatherIntent;

    // make sure middleware is wired up
    if (!context.__) {
      return await context.sendActivity('Oops, this bot is not running correctly');
    }

    switch (intent) {
      case WeatherIntent.getForecast:
        return this.getWeatherForecast(context, recognized);

      case WeatherIntent.getConditionsFeature:
        return this.getWeatherConditions(context, recognized);

      default:
        return context.__sendActivity('Sorry, I do not understand');
    }
  }

  private async getWeatherForecast(context: TurnContextI18N, recognized: RecognizerResult) {
    const weather = createWeatherRequest(recognized, Culture.English);
    const forecast = await this.weather.lookup(weather.place, weather.dateTime);
    const { __ } = context;

    if (forecast) {
      const { date } = weather;
      const { location, summary, day, flags } = forecast;
      const getUnits = getUnitsFor(flags.units);
      await context.__sendActivity('%s will be %s in %s', date, summary, location.description);
      if (day) {
        const averageTemp = (day.temperatureLow + day.temperatureHigh) / 2;
        const units = getUnits('temperature');
        await context.__sendActivity('The average temperatue will be %s with a high of %s at %s',
          formatRounded(__, { value: averageTemp, units }),
          Math.round(day.temperatureHigh),
          moment.tz(day.temperatureHighTime * 1000, location.timezone).format('h a'));
      }
    } else {
      await this.noWeatherData(context, weather);
    }
  }

  private async getWeatherConditions(context: TurnContextI18N, recognized: RecognizerResult) {
    const weather = createConditionsRequest(recognized, Culture.English);
    const conditions = await this.weather.conditions.lookup(weather.place, weather.dateTime, weather.feature);

    if (conditions && conditions.value) {
      await this.getWeatherConditionForDate(context, weather, conditions.value);
    } else if (conditions && conditions.range) {
      await this.getWeatherConditionForDateRange(context);
    } else {
      await this.noWeatherData(context, weather);
    }
  }

  private async getWeatherConditionForDate(context: TurnContextI18N, weather: WeatherConditionsRequest, condition: WeatherCondition) {
    const { feature, date } = weather;
    const featureLabel = getFeatureLabel(feature);
    const { precip, wind, forecast: { location } } = condition;
    const { __ } = context;

    if (precip && precip.probability.value > 0.1) {
      const { type, intensity, accumulation, probability } = precip;
      await context.__sendActivity(`%s, the chance of %s in %s is %s and %s`,
        date,
        type,
        location.description,
        formatPercent(__, probability),
        condition.forecast.summary);

      if (accumulation.value) {
        await context.__sendActivity(`Expect up to %s of %s, with up to %s`,
          formatUnits(__, accumulation),
          type,
          formatUnits(__, intensity));
      }
    } else if (precip) {
      await context.__sendActivity(`It doesn't look like there is any %s in %s %s`,
        weather.requestedFeature,
        location.description,
        date);
    } else if (wind) {
      const { speed, gust, gustTime, bearing } = wind;
      await context.__sendActivity(`The wind speed in %s for %s is %s to the %s, with gusts up to %s`,
        location.description,
        date,
        formatRounded(__, speed),
        getCardinalDirection(bearing.value),
        formatRounded(__, gust));
    } else {
      const { value, units } = condition;
      await context.__sendActivity(`The %s in %s for %s is %s`, featureLabel, location.description, date, `${value} ${units}`);
    }

  }

  private async getWeatherConditionForDateRange(context: TurnContextI18N) {
    await context.__sendActivity('Sorry, that feature is not implemented yet.');
  }

  private async noWeatherData(context: TurnContextI18N, weather: WeatherRequest) {
    const { date, place } = weather;
    await context.__sendActivity('Sorry, I did not find any weather day for %s in %s', date, place);
  }
}

function getCardinalDirection(degrees: number): 'north' | 'north east' | 'east' | 'south east' | 'south' | 'south west' | 'west' | 'north west' {
  if (degrees >= 337.5 || degrees < 22.5) {
    return 'north';
  } else if (degrees >= 22.5 && degrees < 67.5) {
    return 'north east';
  } else if (degrees >= 67.5 && degrees < 112.5) {
    return 'east';
  } else if (degrees >= 112.5 && degrees < 157.5) {
    return 'south east';
  } else if (degrees >= 157.5 && degrees < 202.5) {
    return 'south';
  } else if (degrees >= 202.5 && degrees < 247.5) {
    return 'south west';
  } else if (degrees >= 247.5 && degrees < 292.5) {
    return 'west';
  } else if (degrees >= 292.5 && degrees < 375.5) {
    return 'north west';
  }
}

const formatUnits = (__: I18NFunction, weather: WeatherValue, fn?: (n: number) => number) => {
  const { value, units } = weather;
  return __(`%s ${units}`, fn ? fn(value) : value);
};

const formatPercent = (__: I18NFunction, weather: WeatherValue) => {
  return formatUnits(__, weather, (x) => Math.round(x * 100));
};

const formatRounded = (__: I18NFunction, weather: WeatherValue) => {
  return formatUnits(__, weather, (x) => Math.round(x));
};
