import { ActivityHandler, BotFrameworkAdapter, BotFrameworkAdapterSettings, TurnContext, WebRequest, WebResponse } from 'botbuilder';

export type LogicCallback = (context: TurnContext) => Promise<any>;
export type NextCallback = (err?: any) => void;
export type BotLogic = LogicCallback | ActivityHandler;
export type Settings = Partial<BotFrameworkAdapterSettings>;

export class BotFrameworkAdapterMiddleware extends BotFrameworkAdapter {
  /**
   * Extends the BotFrameworkAdapter to support simplified Connect-style middleware
   * @param settings Optional adapter settings
   */
  constructor(settings?: Settings) {
    super(settings);

    this.onTurnError = async (context, error) => {
      console.error('[ Unhandled Error ]', error);
      await context.sendActivity(`Oops, something went wrong! Check your bot's log.`);
    };
  }

  /**
   * Execute bot logic as Connect-style middleware
   * @param botOrLogic Bot implementation or callback handler to run business logic
   */
  connect(botOrLogic: BotLogic) {
    return async (req: WebRequest, res: WebResponse, next: NextCallback) => {
      try {
        const logic: LogicCallback = typeof botOrLogic === 'function'
          ? botOrLogic
          : (context) => botOrLogic.run(context);
        await this.processActivity(req, res, logic);
      } catch (err) {
        next(err);
      }
    };
  }
}
