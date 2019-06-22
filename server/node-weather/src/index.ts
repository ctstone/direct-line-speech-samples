// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as express from 'express';

import { HelloWorldBot } from './bot';
import { BotFrameworkAdapterMiddleware } from './helpers/bot-framework-adapter-middleware';
import { BotFrameworkAdapterWebSocket } from './helpers/bot-framework-adapter-ws';
import { tokenGenerator } from './helpers/generate-token-middleware';
import { BOT_SETTINGS, PORT } from './settings';

const { appId, appPassword, endpoint, directLineKey } = BOT_SETTINGS;

const adapter = new BotFrameworkAdapterMiddleware({ appId, appPassword });
const webSocketAdapter = new BotFrameworkAdapterWebSocket({ appId, appPassword, endpoint });
const bot = new HelloWorldBot();
const server = express()
  .get('/api/token', tokenGenerator(directLineKey))
  .post(endpoint, adapter.connect(bot))
  .listen(PORT, () => console.log(`Listening on ${PORT}. Connect to the bot using the Bot Framework Emulator.`));

webSocketAdapter.upgrade(server, bot);
