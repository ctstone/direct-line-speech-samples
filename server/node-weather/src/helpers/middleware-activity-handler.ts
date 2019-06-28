import { ActivityHandler, Middleware, MiddlewareHandler, MiddlewareSet, TurnContext } from 'botbuilder';
import { TurnErrorCallback } from './bot-framework-adapter-ws';

export class MiddlewareActivityHandler extends ActivityHandler {
  constructor(
    private bot: ActivityHandler,
    private middleware?: Array<Middleware | MiddlewareHandler>,
    private turnErrorCallback?: TurnErrorCallback) {

    super();

    this.onTurn(async (context, next) => {
      const mw = new MiddlewareSet(...(this.middleware || []));

      try {
        await mw.run(context, async () => {
          await this.bot.run(context);
          await next();
        });
      } catch (err) {
        if (this.turnErrorCallback) {
          try {
            await this.turnErrorCallback(context, err);
          } catch (handlerErr) {
            console.error('Error handler experienced an error', handlerErr);
            console.error('Original error was', err);
          }
        }
      }
    });
  }
}
