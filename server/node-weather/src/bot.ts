// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { Culture, recognizeDateTime } from '@microsoft/recognizers-text-date-time';
import { ActivityHandler, BotHandler, RecognizerResult, TurnContext } from 'botbuilder';
import { LuisRecognizer } from 'botbuilder-ai';

import { DateTime, WeatherEntity } from './luis-model';
import { voice } from './voice';
import { WeatherForecast } from './weather-forecast';

const LANGUAGE = 'en-US';
const VOICE_ID = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaNeural)';

interface WeatherDate {
  start: Date;
  end?: Date;
  type: string;
}

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
    return await context.sendActivity('...');
  }

  private getLocationEntity(recognized: RecognizerResult) {
    const { entities } = recognized;
    return entities[WeatherEntity.location]
      || entities[WeatherEntity.city]
      || entities[WeatherEntity.poi]
      || entities[WeatherEntity.state]
      || entities[WeatherEntity.countryRegion]
      || 'Boston';

    // TODO prompt for Location if missing
  }

  private getDateEntities(recognized: RecognizerResult, culture: string) {
    const [{ text }] = recognized.entities.$instance[WeatherEntity.datetime];
    const [dateTime] = recognizeDateTime(text, culture);
    const [past, future] = dateTime.resolution.values as [DateTime, DateTime];
    const { type, value: dateText, start: startText, end: endText, timex } = future || past;

    let startDate: Date;
    let endDate: Date;

    if ()
  }

}
