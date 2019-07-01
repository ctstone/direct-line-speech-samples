import { ActivityHandler, BotFrameworkAdapter, BotFrameworkAdapterSettings, Middleware, MiddlewareHandler, TurnContext, WebRequest, WebResponse } from 'botbuilder';
import { IncomingMessage, Server as HttpServer, ServerResponse } from 'http';
import { request, Server as HttpsServer } from 'https';
import { WebSocketConnector } from 'microsoft-bot-protocol-streamingextensions';
import { Socket } from 'net';
import url from 'url';

import { MiddlewareActivityHandler } from './middleware-activity-handler';
import { UpgradedResponse } from './upgraded-response';

export type LogicCallback = (context: TurnContext) => Promise<any>;
export type NextCallback = (err?: any) => void;
export type BotLogic = LogicCallback | ActivityHandler;
export interface Settings extends Partial<BotFrameworkAdapterSettings> {
  /** Endpoint path where WebSocket connections should be upgraded (upgradde all paths if empty) */
  endpoint?: string;

  /** Direct Line secret, used to generate individual tokens */
  directLineSecret?: string;
}

const GENERATE_TOKEN_ENDPOINT = 'https://directline.botframework.com/v3/directline/tokens/generate';

export class BotFrameworkAdapter2 extends BotFrameworkAdapter {

  // these properties are private on BotAdapter, so must be duplicated
  private middleware2: Array<MiddlewareHandler | Middleware> = [];
  private turnError2: any;

  set onTurnError(fn: (context: TurnContext, error: Error) => Promise<void>) {
    super.onTurnError = fn;
    this.turnError2 = fn;
  }

  /**
   * Specialized bot adapter that facilitates:
   * - Connecting bot to Node.js web server via connect-style middleware
   * - Enabling Node.js web server to support bot streaming extensions
   * @param settings2 Bot adapter settings
   */
  constructor(private settings2: Settings = {}) {
    super(settings2);
  }

  /**
   * Execute bot logic as Connect-style middleware
   * @param botOrLogic Bot implementation or callback handler to run business logic
   */
  run(botOrLogic: BotLogic) {
    const logic: LogicCallback = typeof botOrLogic === 'function'
      ? botOrLogic
      : (context) => botOrLogic.run(context);
    return async (req: WebRequest, res: WebResponse, next: NextCallback) => {
      try {
        await this.processActivity(req, res, logic);
      } catch (err) {
        next(err);
      }
    };
  }

  /**
   * Exchange direct line secret for a single use token
   */
  generateDirectLineToken() {
    const { directLineSecret } = this.settings2;
    const authorization = `Bearer ${directLineSecret}`;
    const headers = { authorization };
    const method = 'POST';
    const options = { method, headers };

    return (req: IncomingMessage, res: ServerResponse, next: NextCallback) => {
      if (directLineSecret) {
        request(GENERATE_TOKEN_ENDPOINT, options, (tokenRes) => tokenRes.pipe(res))
          .on('error', next)
          .end();
      } else {
        next(new Error('Cannot generate token without `directLineSecret` parameter'));
      }
    };
  }

  use(...middleware: Array<MiddlewareHandler | Middleware>): this {
    super.use(...middleware);
    this.middleware2 = this.middleware2 || [];
    middleware.forEach((x) => this.middleware2.push(x));
    return this;
  }

  /**
   * Enable the Node.js http server to support bot WebSocket requests
   * @param server Standard Node.js http server
   * @param bot Bot logic
   */
  enableStreaming(server: HttpServer | HttpsServer, bot: ActivityHandler) {
    const botHandler = new MiddlewareActivityHandler(bot, this.middleware2, this.turnError2);
    const wsc = new WebSocketConnector(botHandler);
    const { appId, appPassword, endpoint } = this.settings2;
    server.on('upgrade', async (req: IncomingMessage, socket: Socket, head: Buffer) => {
      const { pathname } = url.parse(req.url);

      // only process if no endpoint is specified, or if the current path matches the configured endpoint
      if (!endpoint || pathname === endpoint) {
        try {
          const res = new UpgradedResponse(req, socket, head);
          await wsc.processAsync(req, res, { appId, appPassword });
        } catch (err) {
          console.error(err);
          socket.end();
        }

        // close the socket if this is not a multi-endpoint configuration
      } else if (!endpoint) {
        socket.end();
      }
    });
  }
}
