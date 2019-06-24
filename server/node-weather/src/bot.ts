// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Culture } from '@microsoft/recognizers-text-date-time';
import { ActivityHandler, BotHandler, RecognizerResult, TurnContext } from 'botbuilder';
import { LuisRecognizer } from 'botbuilder-ai';
import Y18N = require('y18n');

import { createConditionsRequest, createWeatherRequest, getFeatureLabel, WeatherConditionsRequest, WeatherRequest } from './entities';
import { WeatherIntent } from './luis-model';
import { voice } from './voice';
import { WeatherCondition } from './weather-conditions';
import { WeatherForecast } from './weather-forecast';

const VOICE_LANGUAGE = 'en-US';
const VOICE_ID = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaNeural)';
const __ = new Y18N().__;

export class WeatherBot extends ActivityHandler {

  constructor(private recognizer: LuisRecognizer, private weather: WeatherForecast) {
    super();
    this.onMembersAdded(this.membersAdded.bind(this));
    this.onMessage(this.message.bind(this));
  }

  private membersAdded: BotHandler = async (context, next) => {
    for (const added of context.activity.membersAdded) {
      const { name, id } = added;
      await context.sendActivity(`${name || id} has joined the chat!`);
    }

    await next();
  }

  private message: BotHandler = async (context) => {
    const recognized = await this.recognizer.recognize(context);
    const intent = LuisRecognizer.topIntent(recognized) as WeatherIntent;
    const say = voice(VOICE_ID, VOICE_LANGUAGE);

    console.dir(recognized.entities, { depth: 10 });

    switch (intent) {
      case WeatherIntent.getForecast:
        return this.getWeatherForecast(context, recognized);

      case WeatherIntent.getConditionsFeature:
        return this.getWeatherConditions(context, recognized);

      default:
        const text = __('Sorry, I do not understand');
        return context.sendActivity(text, say(text));
    }
  }

  private async getWeatherForecast(context: TurnContext, recognized: RecognizerResult) {
    const weather = createWeatherRequest(recognized, Culture.English);
    const say = voice(VOICE_ID, VOICE_LANGUAGE);
    const forecast = await this.weather.lookup(weather.place, weather.dateTime);

    if (forecast) {
      const { date } = weather;
      const { location, summary } = forecast;
      const text = __('The weather in %s for %s will be %s', location.description, date, summary);
      const speech = __('%s will be %s in %s', date, summary, location.description);
      await context.sendActivity(text, say(speech));
    } else {
      await this.noWeatherData(context, weather);
    }
  }

  private async getWeatherConditions(context: TurnContext, recognized: RecognizerResult) {
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

  private async getWeatherConditionForDate(context: TurnContext, weather: WeatherConditionsRequest, condition: WeatherCondition) {
    const { feature, date } = weather;
    const featureLabel = getFeatureLabel(feature);
    const { precip, wind, forecast: { location } } = condition;
    const say = voice(VOICE_ID, VOICE_LANGUAGE);

    console.dir(condition, { depth: 10 });

    if (precip && precip.probability.value > 0.1) {
      const { type, intensity, accumulation, probability } = precip;
      const text1 = (__ as any)(`%s, the chance of %s in %s is %s with %s`,
        date,
        type,
        location.description,
        `${Math.round(probability.value * 100)} ${probability.units}`,
        condition.forecast.summary);
      await context.sendActivity(text1, say(text1));

      if (accumulation.value) {
        const text2 = (__ as any)(`Expect up to %s of %s with up to %s`,
          `${accumulation.value} ${accumulation.units}`,
          type,
          `${intensity.value} ${intensity.units}`);
        await context.sendActivity(text2, say(text2));
      }
    } else if (precip) {
      const { type } = precip;
      const text = (__ as any)(`It doesn't look like there is any %s in %s, %s`,
        weather.requestedFeature,
        location.description,
        date);
      await context.sendActivity(text, say(text));
    } else if (wind) {
      const { speed, gust, gustTime, bearing } = wind;
      const text = (__ as any)(`The wind speed in % for %s is %s at %s, with gusts up to %s`,
        location.description,
        date,
        `${speed.value} ${speed.units}`,
        `${bearing.value} ${bearing.units}`,
        `${gust.value} ${gust.units}`);
      await context.sendActivity(text, say(text));
    } else {
      const { value, units } = condition;
      const text = (__ as any)(`The %s in %s for %s is %s`, featureLabel, location.description, date, `${value} ${units}`);
      await context.sendActivity(text, say(text));
    }
  }

  private async getWeatherConditionForDateRange(context: TurnContext) {
    await context.sendActivity('not implemented');
  }

  private async noWeatherData(context: TurnContext, weather: WeatherRequest) {
    const { date, place } = weather;
    const say = voice(VOICE_ID, VOICE_LANGUAGE);
    const text = __('Sorry, I did not find any weather day for %s in %s', date, place);
    await context.sendActivity(text, say(text));
  }
}
