import { Activity, Middleware, ResourceResponse, TurnContext } from 'botbuilder';

import Y18N, { Options } from 'y18n';

export interface SendActivityOptions {
  speak?: string;
  inputHint?: string;
}

export type I18NFunction = (text: string, ...args: any[]) => string;
export type I18NNumberFunction = (singular: string, plural: string, count: number, ...args: any[]) => string;

export interface TurnContextI18N extends TurnContext {
  __: I18NFunction;
  __n: I18NNumberFunction;

  __sendActivity(textOrActivity: string | Partial<Activity>, ...args: any[]): Promise<ResourceResponse>;
  __sendActivity(textOrActivity: string | Partial<Activity>, options?: SendActivityOptions, ...args: any[]): Promise<ResourceResponse>;

  __nsendActivity(singularText: string | Partial<Activity>, pluralText: string, count: number, ...args: any[]): Promise<ResourceResponse>;
  __nsendActivity(singularText: string | Partial<Activity>, pluralText: string, count: number, options?: SendActivityOptions, ...args: any[]): Promise<ResourceResponse>;
}

export class I18NBotMiddleware implements Middleware {
  private y18n: Y18N;

  constructor(options?: Options) {
    this.y18n = new Y18N(options);
  }

  onTurn(baseContext: TurnContext, next: () => Promise<void>): Promise<void> {
    const context = baseContext as TurnContextI18N;
    const { __, __n, setLocale } = this.y18n;
    const { activity: { locale } } = context;

    context.__ = (...args: any[]) => {
      setLocale(locale);
      return __.apply(null, args);
    };
    context.__n = (...args: any[]) => {
      setLocale(locale);
      return __n.apply(null, args);
    };
    context.__sendActivity = (...args: any[]) => {
      let textOrActivity: string | Activity;
      let options: SendActivityOptions = {};
      let vals: any[];

      // with options
      if (typeof args[1] === 'object') {
        [textOrActivity, options, ...vals] = args;
        // no options
      } else {
        [textOrActivity, ...vals] = args;
      }

      const text = typeof textOrActivity === 'string' ? textOrActivity : textOrActivity.text;
      const textI18n = __(text, ...vals);
      const { speak, inputHint } = options;

      if (typeof textOrActivity === 'string') {
        textOrActivity = textI18n;
      } else {
        textOrActivity.text = textI18n;
      }

      return context.sendActivity(textOrActivity, speak, inputHint);
    };
    context.__nsendActivity = (...args: any[]) => {
      let textOrActivity: string | Activity;
      let plural: string;
      let options: SendActivityOptions = {};
      let vals: any[];
      let count: number;

      // no options
      if (Array.isArray(args[3])) {
        [textOrActivity, plural, count, vals] = args;

        // with options
      } else {
        [textOrActivity, plural, count, options, vals] = args;
      }

      const text = typeof textOrActivity === 'string' ? textOrActivity : textOrActivity.text;
      const textI18n = __n(text, plural, count, ...vals);
      const { speak, inputHint } = options;

      if (typeof textOrActivity !== 'string') {
        textOrActivity.text = textI18n;
      }

      return context.sendActivity(textOrActivity, speak, inputHint);
    };

    return next();
  }
}
