export type SpeechHandler = (text: string) => string;

export function voice(voiceId: string, language: string): SpeechHandler {
  return (text: string) => {
    return `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
      <voice name="${voiceId}">${text}</voice>
    </speak>`;
  };
}
