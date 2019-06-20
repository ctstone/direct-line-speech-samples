import { ActivityHandler, BotFrameworkAdapterSettings } from 'botbuilder';
import { IncomingMessage, Server } from 'http';
import { WebSocketConnector } from 'microsoft-bot-protocol-streamingextensions';
import { Socket } from 'net';
import * as url from 'url';
import { UpgradedResponse } from './upgraded-response';

export interface Settings extends Partial<BotFrameworkAdapterSettings> {
  /** Endpoint path where WebSocket connections should be upgraded (upgradde all paths if empty) */
  endpoint?: string;
}

export class BotFrameworkAdapterWebSocket {
  constructor(private settings?: Settings) { }

  upgrade(server: Server, bot: ActivityHandler) {
    const wsc = new WebSocketConnector(bot);
    const { appId, appPassword, endpoint } = this.settings;
    server.on('upgrade', async (req: IncomingMessage, socket: Socket, head: Buffer) => {
      const { pathname } = url.parse(req.url);
      if (!endpoint || pathname === endpoint) {
        try {
          const res = new UpgradedResponse(req, socket, head);
          await wsc.processAsync(req, res, { appId, appPassword });
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
}
