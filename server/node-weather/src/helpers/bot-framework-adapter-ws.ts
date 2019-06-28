import { ActivityHandler, BotFrameworkAdapterSettings, Middleware, MiddlewareHandler, TurnContext } from 'botbuilder';
import { IncomingMessage, Server } from 'http';
import { WebSocketConnector } from 'microsoft-bot-protocol-streamingextensions';
import { Socket } from 'net';
import url from 'url';

import { MiddlewareActivityHandler } from './middleware-activity-handler';
import { UpgradedResponse } from './upgraded-response';

export type TurnErrorCallback = (context: TurnContext, error: Error) => Promise<void>;

export interface Settings extends Partial<BotFrameworkAdapterSettings> {
  /** Endpoint path where WebSocket connections should be upgraded (upgradde all paths if empty) */
  endpoint?: string;
}

export class BotFrameworkAdapterWebSocket {

  private readonly middleware: Array<Middleware | MiddlewareHandler> = [];
  private turnError: TurnErrorCallback;

  /**
   * Wraps the WebSocketConnector to support simplified http->WebSocket upgrade and routing
   * @param settings Optional adapter settings
   */
  constructor(private settings?: Settings) { }

  /**
   * Upgarde the Node.js http server to support bot WebSocket requests
   * @param server Standard Node.js http server
   * @param bot Bot logic
   */
  upgrade(server: Server, bot: ActivityHandler) {
    const botHandler = new MiddlewareActivityHandler(bot, this.middleware, this.turnError);
    const wsc = new WebSocketConnector(botHandler);
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

  use(...middleware: Array<Middleware | MiddlewareHandler>): this {
    middleware.forEach((x) => this.middleware.push(x));
    return this;
  }

  onTurnError(fn: TurnErrorCallback): this {
    this.turnError = fn;
    return this;
  }
}
