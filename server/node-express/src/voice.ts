export function voice(voiceId: string, language: string) {
  return (text: string) => {
    return `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
      <voice name="${voiceId}">${text}</voice>
    </speak>`;
  };
}
