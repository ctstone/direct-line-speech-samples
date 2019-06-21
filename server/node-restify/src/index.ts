// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as restify from 'restify';

import { HelloWorldBot } from './bot';
import { BOT_SETTINGS, PORT } from './settings';
import { BotFrameworkAdapterConnect } from './wrappers/bot-framework-adapter-connect';
import { BotFrameworkAdapterWebSocket } from './wrappers/bot-framework-adapter-ws';

const { appId, appPassword, endpoint } = BOT_SETTINGS;

const adapter = new BotFrameworkAdapterConnect({ appId, appPassword });
const webSocketAdapter = new BotFrameworkAdapterWebSocket({ appId, appPassword, endpoint });
const bot = new HelloWorldBot();
const server = restify.createServer();

server.post(endpoint, adapter.connect(bot));
server.listen(PORT, () => console.log(`Listening on ${PORT}. Connect to the bot using the Bot Framework Emulator.`));
webSocketAdapter.upgrade(server, bot);
