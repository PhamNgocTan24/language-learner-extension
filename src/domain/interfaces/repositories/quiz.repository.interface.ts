import { QuizEntity } from '../../entities/quiz.entity';

export interface IQuizRepository {
  create(quiz: Partial<QuizEntity>): Promise<QuizEntity>;
  findById(id: string): Promise<QuizEntity | null>;
  findByUserId(userId: string): Promise<QuizEntity[]>;
  findBySaveId(saveId: string): Promise<QuizEntity | null>;
  updateAnswer(id: string, userAnswer: string, isCorrect: boolean): Promise<QuizEntity>;
  deleteById(id: string): Promise<void>;
  countCorrectByUserId(userId: string): Promise<number>;
  countTotalByUserId(userId: string): Promise<number>;
}
