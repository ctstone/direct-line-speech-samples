import { Middleware, TurnContext } from 'botbuilder';

export type VoiceForLocaleCallback = (locale: string) => PromiseLike<VoiceDefinition>;
export type SpeechHandler = (text: string) => string;

export interface VoiceDefinition {
  language: string;
  voiceId: string;
}

export interface SpeechOptions {
  defaultVoice?: VoiceDefinition;
  voiceForLocale?: VoiceForLocaleCallback;
}

const VOICE_LANGUAGE = 'en-US';
const VOICE_ID = 'Microsoft Server Speech Text to Speech Voice (en-US, JessaNeural)';

export class SpeechBotMiddleware implements Middleware {
  constructor(private options?: SpeechOptions) {
    this.options = options || { };
    if (!this.options.defaultVoice) {
      this.options.defaultVoice = {
        language: VOICE_LANGUAGE,
        voiceId: VOICE_ID,
      };
    }
  }

  onTurn(context: TurnContext, next: () => Promise<void>): Promise<void> {
    context.onSendActivities(async (ctx, activities, next) => {
      const { locale } = ctx.activity;
      const { voiceId, language } = await this.getVoice(locale);
      const say = voice(voiceId, language);

      for (const activity of activities) {
        if (activity.text && !activity.speak) {
          activity.speak = say(activity.text);
        }
      }

      return next();
    });
    return next();
  }

  private async getVoice(locale: string) {
    const { defaultVoice, voiceForLocale } = this.options;
    let voice;

    if (voiceForLocale) {
      voice = await voiceForLocale(locale);
    }

    return voice || defaultVoice;
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
