// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BotFrameworkAdapter, TurnContext } from 'botbuilder';
import * as express from 'express';
import { WebSocketConnector } from 'microsoft-bot-protocol-streamingextensions';

import { HelloWorldBot } from './bot';
import { BOT_SETTINGS, PORT } from './settings';

const { appId, appPassword } = BOT_SETTINGS;
const adapter = new BotFrameworkAdapter({ appId, appPassword });
adapter.onTurnError = async (context: TurnContext, error) => {
  console.error('[ Unhandled Error ] ', error);
  await context.sendActivity(`Oops, something went wrong! Check your bot's log`);
};

const bot = new HelloWorldBot();
const webSocketConnector = new WebSocketConnector(bot);

express()
  .post('/api/messages', async (req, res, next) => {
    try {
      await adapter.processActivity(req, res, (context) => bot.run(context));
    } catch (err) {
      next(err);
    }
  })
  .get('/api/messages', (req, res, next) => {
    webSocketConnector.processAsync(req, res, { appId, appPassword });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}. Connect to the bot using the Bot Framework Emulator.`));
