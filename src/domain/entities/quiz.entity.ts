/**
 * Domain Quiz entity — a multiple-choice question generated from a Save.
 * Pure TypeScript, no ORM decorators.
 */
export class QuizEntity {
  id: string;
  userId: string;
  saveId: string;
  question: string;
  options: string[]; // ["A. ...", "B. ...", "C. ...", "D. ..."]
  correct: string; // "A" | "B" | "C" | "D"
  explanation: string;
  userAnswer: string | null; // null = not answered yet
  isCorrect: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}
