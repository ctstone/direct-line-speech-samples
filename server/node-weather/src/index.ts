// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import express from 'express';

import { WeatherBot } from './bot';
import { BotFrameworkAdapterMiddleware } from './helpers/bot-framework-adapter-middleware';
import { BotFrameworkAdapterWebSocket } from './helpers/bot-framework-adapter-ws';
import { tokenGenerator } from './helpers/generate-token-middleware';
import { I18NBotMiddleware } from './helpers/i18n-bot-middleware';
import { SpeechBotMiddleware } from './helpers/speech-bot-middleware';
import { createWeatherForecast, createWeatherRecognizer } from './services';
import { BOT_SETTINGS, PORT } from './settings';

const { appId, appPassword, endpoint, directLineKey } = BOT_SETTINGS;

const adapter = new BotFrameworkAdapterMiddleware({ appId, appPassword })
  .use(
    new I18NBotMiddleware({ directory: `${__dirname}/../data/locales` }),
    new SpeechBotMiddleware());

const recognizer = createWeatherRecognizer();
const weatherForecast = createWeatherForecast();
const bot = new WeatherBot(recognizer, weatherForecast);
const server = express()
  .use(express.static(`${__dirname}/../data/public`))
  .use('/api/tokens/generate', tokenGenerator(directLineKey))
  .post(endpoint, adapter.connect(bot))
  .listen(PORT, () => console.log(`Listening on http://localhost:${PORT}${endpoint}. Connect to the bot using the Bot Framework Emulator.`));

new BotFrameworkAdapterWebSocket({ appId, appPassword, endpoint })
  .use(
    new I18NBotMiddleware({ directory: `${__dirname}/../data/locales` }),
    new SpeechBotMiddleware())
  .onTurnError(async (context) => {
    await context.sendActivity('Opps, an error!');
  })
  .upgrade(server, bot);
