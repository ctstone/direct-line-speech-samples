import { Middleware, TurnContext } from 'botbuilder';

export type VoiceCallback = (locale: string) => PromiseLike<VoiceDefinition>;
export type SsmlGeneratorCallback = (locale: string) => PromiseLike<SpeechHandler>;
export type SpeechHandler = (text: string) => string;

export interface VoiceDefinition {
  language: string;
  voiceId: string;
}

export interface SpeechOptions {
  defaultVoice?: VoiceDefinition;
  voiceForLocale?: VoiceCallback;
  ssmlForLocale?: SsmlGeneratorCallback;
}

export const DEFAULT_VOICE: VoiceDefinition = {
  language: 'en-US',
  voiceId: 'Microsoft Server Speech Text to Speech Voice (en-US, JessaNeural)',
};

export class SpeechBotMiddleware implements Middleware {
  constructor(private options?: SpeechOptions) {
    this.options = options || { };
    this.options.defaultVoice = this.options.defaultVoice || DEFAULT_VOICE;
  }

  onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
    context.onSendActivities(async (ctx, activities, next) => {
      const { locale } = ctx.activity;
      const say = await this.getSsmlGenerator(locale);

      for (const activity of activities) {
        if (activity.text && !activity.speak) {
          activity.speak = say(activity.text);
        }
      }

      return next();
    });
    return next();
  }

  private async getSsmlGenerator(locale: string) {
    const { ssmlForLocale } = this.options;

    return ssmlForLocale
      ? await ssmlForLocale(locale)
      : await this.getVoice(locale);
  }

  private async getVoice(locale: string) {
    const { defaultVoice, voiceForLocale } = this.options;
    let voiceDef;

    if (voiceForLocale) {
      voiceDef = await voiceForLocale(locale);
    }

    const { voiceId, language } = voiceDef || defaultVoice;
    return voice(voiceId, language);
  }
}

export function voice(voiceId: string, language: string): SpeechHandler {
  return (text: string) => {
    return `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
      <voice name="${voiceId}">${text}</voice>
    </speak>`;
  };
}
