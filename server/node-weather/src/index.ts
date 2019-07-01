// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import express from 'express';

import { WeatherBot } from './bot';
import { BotFrameworkAdapter2 } from './helpers/bot-framework-adapter-2';
import { I18NBotMiddleware } from './helpers/i18n-bot-middleware';
import { SpeechBotMiddleware } from './helpers/speech-bot-middleware';
import { createWeatherForecast, createWeatherRecognizer } from './services';
import { BOT_SETTINGS, PORT } from './settings';

const { appId, appPassword, endpoint, directLineSecret } = BOT_SETTINGS;
const adapter = new BotFrameworkAdapter2({ appId, appPassword, directLineSecret, endpoint })
  .use(
    new I18NBotMiddleware({ directory: `${__dirname}/../data/locales` }),
    new SpeechBotMiddleware());
const recognizer = createWeatherRecognizer();
const weatherForecast = createWeatherForecast();
const bot = new WeatherBot(recognizer, weatherForecast);
const server = express()
  .use(express.static(`${__dirname}/../data/public`))
  .use('/api/tokens/generate', adapter.generateDirectLineToken())
  .post(endpoint, adapter.run(bot))
  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}${endpoint}. Connect to the bot using the Bot Framework Emulator.`));

adapter.enableStreaming(server, bot);
adapter.onTurnError = async (context, error) => {
  console.error('[ Unhandled Error ]', error);
  await context.sendActivity(`Oops, something went wrong! Check your bot's log.`);
};
