import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ILLMProvider, QuizPrompt, QuizResponse } from '../../domain/services/llm/llm.interface';

/**
 * LlmService — retry wrapper + JSON validation.
 * Application services always call this, never providers directly.
 * Handles 3 retry attempts and validates the quiz response shape.
 */
@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);

  constructor(@Inject('LLM_PROVIDER') private readonly provider: ILLMProvider) {}

  async generateQuiz(prompt: QuizPrompt): Promise<QuizResponse> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await this.provider.generateQuiz(prompt);
        if (this.isValidQuiz(result)) return result;
        this.logger.warn(`Attempt ${attempt}: invalid quiz shape received`);
      } catch (err) {
        this.logger.warn(`Attempt ${attempt} failed: ${(err as Error).message}`);
        if (attempt === 3) {
          throw new ServiceUnavailableException('Quiz generation failed after 3 attempts');
        }
      }
    }
    throw new ServiceUnavailableException('Quiz generation failed — invalid response');
  }

  async suggestCategory(text: string): Promise<string> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await this.provider.suggestCategory(text);
      } catch (err) {
        this.logger.warn(
          `Category suggestion attempt ${attempt} failed: ${(err as Error).message}`,
        );
        if (attempt === 3) {
          throw new ServiceUnavailableException('Category suggestion failed after 3 attempts');
        }
      }
    }
    return 'Vocabulary'; // fallback — never reached
  }

  private isValidQuiz(data: any): data is QuizResponse {
    return (
      typeof data?.question === 'string' &&
      Array.isArray(data?.options) &&
      data.options.length === 4 &&
      typeof data?.correct === 'string' &&
      typeof data?.explanation === 'string'
    );
  }
}
