import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IQuizRepository } from '../../domain/interfaces/repositories/quiz.repository.interface';
import { IISaveRepository } from '../../domain/interfaces/repositories/save.repository.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { QuizEntity } from '../../domain/entities/quiz.entity';
import { QuizPromptBuilder } from '../../domain/services/llm/quiz-prompt.builder';
import { LlmService } from '../../infrastructure/llm/llm.service';
import { RedisService } from '../../infrastructure/redis/redis.service';

@Injectable()
export class QuizService {
  constructor(
    @Inject('QUIZ_REPOSITORY') private readonly quizRepo: IQuizRepository,
    @Inject('SAVE_REPOSITORY') private readonly saveRepo: IISaveRepository,
    @Inject('USER_REPOSITORY') private readonly userRepo: IUserRepository,
    private readonly llmService: LlmService,
    private readonly redisService: RedisService,
  ) {}

  async generate(userId: string, saveId: string): Promise<QuizEntity> {
    const save = await this.saveRepo.findById(saveId);
    if (!save) throw new NotFoundException('Save not found');
    if (save.userId !== userId) throw new ForbiddenException('Access denied');

    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Check Redis cache first — avoid duplicate LLM calls
    const cached = await this.redisService.getCachedQuiz(saveId, user.level);
    if (cached) {
      const cachedQuiz = JSON.parse(cached);
      // If a quiz record already exists for this save, return it
      const existing = await this.quizRepo.findBySaveId(saveId);
      if (existing) return existing;
      // Otherwise persist the cached LLM response
      return this.quizRepo.create({
        userId,
        saveId,
        question: cachedQuiz.question,
        options: cachedQuiz.options,
        correct: cachedQuiz.correct,
        explanation: cachedQuiz.explanation,
      });
    }

    const prompt = QuizPromptBuilder.build(save, user);
    const response = await this.llmService.generateQuiz(prompt);

    // Cache the raw LLM response (7 days)
    await this.redisService.setCachedQuiz(saveId, user.level, JSON.stringify(response));

    return this.quizRepo.create({
      userId,
      saveId,
      question: response.question,
      options: response.options,
      correct: response.correct,
      explanation: response.explanation,
    });
  }

  async submitAnswer(userId: string, quizId: string, userAnswer: string): Promise<QuizEntity> {
    const quiz = await this.quizRepo.findById(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.userId !== userId) throw new ForbiddenException('Access denied');

    const isCorrect = quiz.correct === userAnswer;
    return this.quizRepo.updateAnswer(quizId, userAnswer, isCorrect);
  }

  async getHistory(userId: string): Promise<QuizEntity[]> {
    return this.quizRepo.findByUserId(userId);
  }
}
