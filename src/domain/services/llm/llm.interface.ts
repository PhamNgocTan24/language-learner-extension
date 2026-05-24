import { UserLevel } from '../../entities/user.entity';
import { SaveCategory } from '../../entities/save.entity';

export interface QuizPrompt {
  word: string;
  sentence: string;
  paragraph: string;
  sourceTitle: string;
  userLevel: UserLevel;
  category: SaveCategory | string;
}

export interface QuizResponse {
  question: string;
  options: string[]; // exactly 4 items: ["A. ...", "B. ...", ...]
  correct: string; // "A" | "B" | "C" | "D"
  explanation: string;
}

export interface SuggestResponse {
  category: SaveCategory;
  suggest_correct_word: string | null;
}

export interface FlashcardPrompt {
  text: string;
  sentence: string;
  paragraph: string;
  category: SaveCategory | string;
  userLevel: UserLevel;
  userNativeLanguage: string;
}

export interface FlashcardResponse {
  pronunciation: string | null;
  meaning: string;
  usage: string;
  example: string;
}

export interface ILLMProvider {
  generateQuiz(prompt: QuizPrompt): Promise<QuizResponse>;
  suggest(text: string, sentence: string, paragraph: string): Promise<SuggestResponse>;
  generateFlashcard(prompt: FlashcardPrompt): Promise<FlashcardResponse>;
}
