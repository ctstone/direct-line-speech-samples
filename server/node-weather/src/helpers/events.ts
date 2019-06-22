import { ActivityTypes, Middleware, TurnContext } from 'botbuilder';

const EVENT_RE = /\/([^:/]+?)(?:(?::|\/)(.+)|$)/;

/**
 * Bot middleware to convert text messages in the format `/eventType` or `/eventType:payload` to an activity:
 * @example
 * {
 *   type: 'Event',
 *   valueType: {eventType},
 *   value: {payload},
 *   text: ''
 * }
 */
export class BotEventTextMiddleware implements Middleware {
  async onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
    if (context.activity.type === ActivityTypes.Message && context.activity.text.startsWith('/')) {
      const match = EVENT_RE.exec(context.activity.text);
      if (match) {
        const [, valueType, body] = match;
        await context.sendActivity({
          type: ActivityTypes.Trace,
          text: `Rewriting message as '${valueType}' event with value '${body}'`,
        });
        context.activity.type = ActivityTypes.Event;
        context.activity.valueType = valueType;
        context.activity.text = '';
        try {
          context.activity.value = JSON.parse(body);
        } catch (err) { /* noop */ }
      }
    }
    return await next();
  }
}
