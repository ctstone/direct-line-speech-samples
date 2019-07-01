import { ActivityHandler, Middleware, MiddlewareHandler, MiddlewareSet } from 'botbuilder';

export class MiddlewareActivityHandler extends ActivityHandler {

  /**
   * Currently there is no support for middleware handling in a streaming-extension bot.
   * Use this utility to wrap middleware and onTurnError around the bot implementation
   * @param bot The bot logic to run
   * @param middleware Any middleware that should be registered
   * @param turnErrorCallback Error handler
   */
  constructor(
    private bot: ActivityHandler,
    private middleware?: Array<Middleware | MiddlewareHandler>,
    private turnErrorCallback?: any) {

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
