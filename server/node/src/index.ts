// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as express from 'express';

import { HelloWorldBot } from './bot';
import { createBotAdapter, createBotWebSocketAdapter } from './services';
import { BOT_SETTINGS, PORT } from './settings';

const { endpoint } = BOT_SETTINGS;
const adapter = createBotAdapter();
const webSocketAdapter = createBotWebSocketAdapter();
const bot = new HelloWorldBot();
const server = express()
  .post(endpoint, adapter.connect(bot))
  .listen(PORT, () => console.log(`Listening on ${PORT}. Connect to the bot using the Bot Framework Emulator.`));

webSocketAdapter.upgrade(server, bot);
