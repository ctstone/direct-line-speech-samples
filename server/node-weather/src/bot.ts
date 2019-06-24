// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Culture, recognizeDateTime } from '@microsoft/recognizers-text-date-time';
import { ActivityHandler, BotHandler, RecognizerResult, TurnContext } from 'botbuilder';
import { LuisRecognizer } from 'botbuilder-ai';

import { WeatherEntity } from './luis-model';
import { RelativeDateTime, DateTime } from './time';
import { voice } from './voice';
import { WeatherForecast } from './weather-forecast';

const LANGUAGE = 'en-US';
const VOICE_ID = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaNeural)';

export class WeatherBot extends ActivityHandler {

  speaker = voice(VOICE_ID, LANGUAGE);

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

  private message: BotHandler = async (context, next) => {
    const recognized = await this.recognizer.recognize(context);
    const intent = LuisRecognizer.topIntent(recognized);

    switch (intent) {
      case 'Weather_GetForecast':
        return this.getWeatherForecast(context, recognized.entities);

      default:
        return context.sendActivity('Sorry, I do not understand');
    }

    // const { text } = context.activity;
    // const speak = this.speaker(`You said: "${text}"`);
    // await context.sendActivity(`Intent is ${intent}`, speak);
  }

  private async getWeatherForecast(context: TurnContext, recognized: RecognizerResult) {
    const place = this.getPlaceEntity(recognized);
    const relativeDateTime = this.getRelativeDateEntity(recognized, Culture.English);

    return await context.sendActivity('...');
  }

  private getPlaceEntity(recognized: RecognizerResult): string {
    const { entities } = recognized;
    return entities[WeatherEntity.location]
      || entities[WeatherEntity.city]
      || entities[WeatherEntity.poi]
      || entities[WeatherEntity.state]
      || entities[WeatherEntity.countryRegion]
      || 'Boston';

    // TODO prompt for Location if missing
  }

  private getRelativeDateEntity(recognized: RecognizerResult, culture: string): RelativeDateTime {
    const [{ text }] = recognized.entities.$instance[WeatherEntity.datetime];
    const [dateTime] = recognizeDateTime(text, culture);
    const [past, future] = dateTime.resolution.values as [RelativeDateTime, RelativeDateTime];
    return future || past;
  }

}
