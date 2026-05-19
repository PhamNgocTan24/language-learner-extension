import { SaveEntity } from '../../entities/save.entity';
import { UserEntity } from '../../entities/user.entity';
import { QuizPrompt } from './llm.interface';

/**
 * Builds a structured LLM prompt from a SaveEntity + user level.
 * Lives in domain because it encodes pure business rules about
 * how context is presented to the model — no HTTP, no DB.
 */
export class QuizPromptBuilder {
  static build(save: SaveEntity, user: UserEntity): QuizPrompt {
    return {
      word: save.text,
      sentence: save.sentence ?? save.text,
      paragraph: save.paragraph ?? save.sentence ?? save.text,
      sourceTitle: save.sourceTitle ?? 'Unknown source',
      userLevel: user.level,
      category: save.category ?? 'Vocabulary',
    };
  }

  /**
   * Renders the prompt as the string that gets sent to the LLM.
   * Providers call this internally — they should not construct prompts themselves.
   */
  static render(p: QuizPrompt): string {
    return `You are an English learning assistant.
User level: ${p.userLevel}. Category: ${p.category}.

The user saved this while reading:
Word/Phrase: "${p.word}"
Full sentence: "${p.sentence}"
Paragraph context: "${p.paragraph}"
Source: "${p.sourceTitle}"

Generate 1 multiple-choice question to test understanding of this word/phrase in context.
Respond ONLY with valid JSON. No markdown. No explanation outside JSON.

{
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct": "A",
  "explanation": "..."
}`;
  }
}
