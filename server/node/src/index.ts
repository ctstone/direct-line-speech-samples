// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { BotFrameworkAdapter, TurnContext } from 'botbuilder';
import * as express from 'express';
import * as expressWs from 'express-ws';
import { IncomingMessage } from 'http';
import { WebSocketConnector } from 'microsoft-bot-protocol-streamingextensions';
import { Socket } from 'net';
import * as restify from 'restify';

import { HelloWorldBot } from './bot';
import { BOT_SETTINGS, PORT } from './settings';
import { UpgradedResponse } from './upgraded-response';

const { appId, appPassword } = BOT_SETTINGS;
const adapter = new BotFrameworkAdapter({ appId, appPassword });
adapter.onTurnError = async (context: TurnContext, error) => {
  console.error('[ Unhandled Error ] ', error);
  await context.sendActivity(`Oops, something went wrong! Check your bot's log`);
};

const bot = new HelloWorldBot();
const webSocketConnector = new WebSocketConnector(bot);

// expressWs(express()).app
//   .post('/api/messages', async (req, res, next) => {
//     try {
//       await adapter.processActivity(req, res, (context) => bot.run(context));
//     } catch (err) {
//       next(err);
//     }

//   })
//   .ws('/api/messages', async (ws, req, next) => {
//     ws.on('upgrade', () => {
//       console.log('upgrade');
//     });
//     ws.on('message', (data) => {
//       console.log('DATA', data);
//       ws.send('you said ' + data);
//     });
//     // try {
//     // await webSocketConnector.processAsync(req, res, { appId, appPassword });
//     // } catch (err) {
//     //   next(err);
//     // }

//   })
//   .listen(PORT, () => console.log(`Listening on ${PORT}. Connect to the bot using the Bot Framework Emulator.`));

// const app = express()
//   .post('/api/messages', async (req, res, next) => {
//     try {
//       await adapter.processActivity(req, res, (context) => bot.run(context));
//     } catch (err) {
//       next(err);
//     }
//   })
//   // .get('/api/messages', async (req, res, next) => {
//   //   console.log(Object.keys(res));
//   //   try {
//   //     await webSocketConnector.processAsync(req, res, { appId, appPassword });
//   //   } catch (err) {
//   //     next(err);
//   //   }
//   // })
//   ;

// const server = app
//   .listen(PORT, () => console.log(`Listening on ${PORT}. Connect to the bot using the Bot Framework Emulator.`))
//   .on('upgrade', async (req: IncomingMessage, socket: Socket, head: Buffer) => {
//     try {
//       const res = new UpgradedResponse(req, socket, head);
//       await webSocketConnector.processAsync(req, res, { appId, appPassword });
//     } catch (err) {
//       console.error(err);
//       throw err;
//     }
//   })
//   ;

const server = restify.createServer({ handleUpgrades: true });
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`\n${server.name} listening to ${server.url}`);
  console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
  console.log(`\nSee https://aka.ms/connect-to-bot for more information`);
});

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, async (context) => {
    // Route to main dialog.
    await bot.run(context);
  });
});

server.get('/api/messages', function handleUpgrades(req, res, next) {
  const wsc = new WebSocketConnector(bot);

  wsc.processAsync(req, res, {
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
  });
});
