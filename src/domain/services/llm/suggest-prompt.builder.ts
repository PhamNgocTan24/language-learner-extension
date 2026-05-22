export class SuggestPromptBuilder {
  static build(text: string, sentence: string, paragraph: string): string {
    return `
You are an English learning assistant.

The user highlighted this text while reading: "${text}"
Full sentence context: "${sentence}"
Paragraph: "${paragraph}"

Task 1 - Categorize the highlighted text:
- Vocabulary: single word or compound word
- Phrase: multi-word expression (not a complete sentence)
- Grammar: grammatical structure or rule
- Idiom: figurative expression
- Pronunciation: user wants to know how to pronounce it

Task 2 - Check if the highlighted text appears to be a partial/incomplete word or phrase.
Compare "${text}" against the sentence context.
If it looks like the user accidentally highlighted only part of a word or phrase
(e.g. "ello" instead of "Hello", "subscri" instead of "subscriptions"),
return the complete correct form.
If the text is complete and correct, return null.

Respond ONLY with valid JSON. No markdown. No explanation.
{
  "category": "Vocabulary",
  "suggest_correct_word": "Hello"
}`;
  }
}
