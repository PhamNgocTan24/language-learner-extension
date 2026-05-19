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

export interface ILLMProvider {
  generateQuiz(prompt: QuizPrompt): Promise<QuizResponse>;
  suggestCategory(text: string): Promise<string>;
}
