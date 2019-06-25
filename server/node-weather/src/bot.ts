// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Culture } from '@microsoft/recognizers-text-date-time';
import { ActivityHandler, BotHandler, RecognizerResult, TurnContext } from 'botbuilder';
import { LuisRecognizer } from 'botbuilder-ai';

import { createConditionsRequest, createWeatherRequest, getFeatureLabel, WeatherConditionsRequest, WeatherRequest } from './entities';
import { TurnContextI18N } from './helpers/i18n-bot-middleware';
import { WeatherIntent } from './luis-model';
import { WeatherCondition } from './weather-conditions';
import { WeatherForecast } from './weather-forecast';

export class WeatherBot extends ActivityHandler {

  constructor(private recognizer: LuisRecognizer, private weather: WeatherForecast) {
    super();
    this.onMessage(this.message.bind(this));
  }

  private message: BotHandler = async (context: TurnContextI18N) => {
    const recognized = await this.recognizer.recognize(context);
    const intent = LuisRecognizer.topIntent(recognized) as WeatherIntent;

    console.dir(recognized, { depth: 10 });

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
      const { location, summary } = forecast;
      await context.__sendActivity('%s will be %s in %s', date, summary, location.description);
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

    if (precip && precip.probability.value > 0.1) {
      const { type, intensity, accumulation, probability } = precip;
      await context.__sendActivity(`%s, the chance of %s in %s is %s with %s`,
        date,
        type,
        location.description,
        `${Math.round(probability.value * 100)} ${probability.units}`,
        condition.forecast.summary);

      if (accumulation.value) {
        await context.__sendActivity(`Expect up to %s of %s with up to %s`,
          `${accumulation.value} ${accumulation.units}`,
          type,
          `${intensity.value} ${intensity.units}`);
      }
    } else if (precip) {
      await context.__sendActivity(`It doesn't look like there is any %s in %s, %s`,
        weather.requestedFeature,
        location.description,
        date);
    } else if (wind) {
      const { speed, gust, gustTime, bearing } = wind;
      await context.__sendActivity(`The wind speed in % for %s is %s at %s, with gusts up to %s`,
        location.description,
        date,
        `${speed.value} ${speed.units}`,
        `${bearing.value} ${bearing.units}`,
        `${gust.value} ${gust.units}`);
    } else {
      const { value, units } = condition;
      await context.__sendActivity(`The %s in %s for %s is %s`, featureLabel, location.description, date, `${value} ${units}`);
    }
  }

  private async getWeatherConditionForDateRange(context: TurnContextI18N) {
    await context.sendActivity('not implemented');
  }

  private async noWeatherData(context: TurnContextI18N, weather: WeatherRequest) {
    const { date, place } = weather;
    await context.__sendActivity('Sorry, I did not find any weather day for %s in %s', date, place);
  }
}
