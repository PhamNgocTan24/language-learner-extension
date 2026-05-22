import { Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { SaveCategory } from '../../domain/entities/save.entity';
import {
  FlashcardPrompt,
  FlashcardResponse,
  ILLMProvider,
  QuizPrompt,
  QuizResponse,
  SuggestResponse,
} from '../../domain/services/llm/llm.interface';

/**
 * LlmService - retry wrapper + response validation.
 * Application services always call this, never providers directly.
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
    throw new ServiceUnavailableException('Quiz generation failed - invalid response');
  }

  async suggestCategory(text: string): Promise<string> {
    const result = await this.suggest(text, text, text);
    return result.category;
  }

  async suggest(text: string, sentence: string, paragraph: string): Promise<SuggestResponse> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await this.provider.suggest(text, sentence, paragraph);
        if (this.isValidSuggest(result)) return result;
        this.logger.warn(`Suggestion attempt ${attempt}: invalid response shape received`);
      } catch (err) {
        this.logger.warn(`Suggestion attempt ${attempt} failed: ${(err as Error).message}`);
        if (attempt === 3) {
          throw new ServiceUnavailableException('Suggestion failed after 3 attempts');
        }
      }
    }
    throw new ServiceUnavailableException('Suggestion failed - invalid response');
  }

  async generateFlashcard(prompt: FlashcardPrompt): Promise<FlashcardResponse> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await this.provider.generateFlashcard(prompt);
        if (this.isValidFlashcard(result)) return result;
        this.logger.warn(`Flashcard attempt ${attempt}: invalid response shape received`);
      } catch (err) {
        this.logger.warn(`Flashcard attempt ${attempt} failed: ${(err as Error).message}`);
        if (attempt === 3) {
          throw new ServiceUnavailableException('Flashcard generation failed after 3 attempts');
        }
      }
    }
    throw new ServiceUnavailableException('Flashcard generation failed - invalid response');
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

  private isValidSuggest(data: any): data is SuggestResponse {
    return (
      this.isSaveCategory(data?.category) &&
      (typeof data?.suggest_correct_word === 'string' || data?.suggest_correct_word === null)
    );
  }

  private isValidFlashcard(data: any): data is FlashcardResponse {
    return (
      (typeof data?.pronunciation === 'string' || data?.pronunciation === null) &&
      typeof data?.meaning === 'string' &&
      typeof data?.usage === 'string' &&
      typeof data?.example === 'string'
    );
  }

  private isSaveCategory(value: any): value is SaveCategory {
    return ['Vocabulary', 'Phrase', 'Grammar', 'Idiom', 'Pronunciation'].includes(value);
  }
}
