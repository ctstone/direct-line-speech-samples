// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as express from 'express';

import { WeatherBot } from './bot';
import { BotFrameworkAdapterMiddleware } from './helpers/bot-framework-adapter-middleware';
import { BotFrameworkAdapterWebSocket } from './helpers/bot-framework-adapter-ws';
import { tokenGenerator } from './helpers/generate-token-middleware';
import { createWeatherForecast, createWeatherRecognizer } from './services';
import { BOT_SETTINGS, PORT } from './settings';

const { appId, appPassword, endpoint, directLineKey } = BOT_SETTINGS;

const adapter = new BotFrameworkAdapterMiddleware({ appId, appPassword });
const webSocketAdapter = new BotFrameworkAdapterWebSocket({ appId, appPassword, endpoint });
const recognizer = createWeatherRecognizer();
const weatherForecast = createWeatherForecast();
const bot = new WeatherBot(recognizer, weatherForecast);
const server = express()
  .use(express.static(`${__dirname}/../public`))
  .use('/api/tokens/generate', tokenGenerator(directLineKey))
  .post(endpoint, adapter.connect(bot))
  .listen(PORT, () => console.log(`Listening on ${PORT}. Connect to the bot using the Bot Framework Emulator.`));

webSocketAdapter.upgrade(server, bot);
