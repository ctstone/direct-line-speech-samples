// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivityHandler, BotFrameworkAdapter, TurnContext } from 'botbuilder';
import * as express from 'express';
import { IncomingMessage } from 'http';
import { WebSocketConnector } from 'microsoft-bot-protocol-streamingextensions';
import { Socket } from 'net';
import * as restify from 'restify';
import * as url from 'url';

import { HelloWorldBot } from './bot';
import { BOT_SETTINGS, PORT } from './settings';
import { UpgradedResponse } from './upgraded-response';

const { appId, appPassword, endpoint } = BOT_SETTINGS;
const adapter = new BotFrameworkAdapter({ appId, appPassword });
const bot = new HelloWorldBot();
const webSocketConnector = new WebSocketConnector(bot);

adapter.onTurnError = async (context: TurnContext, error) => {
  console.error('[ Unhandled Error ] ', error);
  await context.sendActivity(`Oops, something went wrong! Check your bot's log`);
};

// startWithRestify(bot, adapter, webSocketConnector);
startWithExpress(bot, adapter, webSocketConnector);

function startWithExpress(bot: ActivityHandler, adapter: BotFrameworkAdapter, webSocketConnector: WebSocketConnector) {
  express()
    .post(endpoint, async (req, res, next) => {
      try {
        await adapter.processActivity(req, res, (context) => bot.run(context));
      } catch (err) {
        next(err);
      }
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}. Connect to the bot using the Bot Framework Emulator.`))
    .on('upgrade', async (req: IncomingMessage, socket: Socket, head: Buffer) => {
      const { pathname } = url.parse(req.url);
      if (pathname === endpoint) {
        try {
          const res = new UpgradedResponse(req, socket, head);
          await webSocketConnector.processAsync(req, res, { appId, appPassword });
        } catch (err) {
          console.error(err);
          socket.end();
        }
      } else {
        console.warn('WebSocket upgrade requested on invalid path: ' + pathname);
        socket.end();
      }
    });
}

function startWithRestify(bot: ActivityHandler, adapter: BotFrameworkAdapter, webSocketConnector: WebSocketConnector) {
  const server = restify.createServer({ handleUpgrades: true });
  server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nSee https://aka.ms/connect-to-bot for more information`);
  });

  server.post(endpoint, (req, res) => {
    adapter.processActivity(req, res, async (context) => {
      await bot.run(context);
    });
  });

  server.get(endpoint, function handleUpgrades(req, res, next) {
    webSocketConnector.processAsync(req, res, {
      appId: process.env.MicrosoftAppId,
      appPassword: process.env.MicrosoftAppPassword,
    });
  });
}
