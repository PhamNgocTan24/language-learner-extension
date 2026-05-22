import { FlashcardPrompt } from './llm.interface';

export class FlashcardPromptBuilder {
  static build(p: FlashcardPrompt): string {
    const needsPronunciation = p.category !== 'Grammar';

    return `
You are an English learning assistant.
User level: ${p.userLevel}. Native language: ${p.userNativeLanguage}.

Word/Phrase saved: "${p.text}"
Context sentence: "${p.sentence}"
Paragraph: "${p.paragraph}"
Category: ${p.category}

Generate flashcard content. Keep everything concise.
${needsPronunciation ? `Pronunciation: IPA format for the saved word or phrase, for example /həˈloʊ/` : `Pronunciation: null (not needed for Grammar)`}
Meaning: 1-2 short definitions in ${p.userNativeLanguage}
Usage: 1 short sentence explaining when/how to use it (in English)
Example: 1 natural example sentence using this word in a similar context to "${p.sentence}"

Respond ONLY with valid JSON:
{
  "pronunciation": "/həˈloʊ/" or null,
  "meaning": "nghia ngan gon bang tieng Viet",
  "usage": "Used when greeting someone.",
  "example": "Hello, how are you doing today?"
}`;
  }
}
