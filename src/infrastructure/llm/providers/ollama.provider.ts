import { Injectable, Logger } from '@nestjs/common';
import {
  FlashcardPrompt,
  FlashcardResponse,
  ILLMProvider,
  QuizPrompt,
  QuizResponse,
  SuggestResponse,
} from '../../../domain/services/llm/llm.interface';
import { FlashcardPromptBuilder } from '../../../domain/services/llm/flashcard-prompt.builder';
import { QuizPromptBuilder } from '../../../domain/services/llm/quiz-prompt.builder';
import { SuggestPromptBuilder } from '../../../domain/services/llm/suggest-prompt.builder';

/**
 * Ollama provider - local dev, no API key required.
 * Calls the Ollama HTTP API directly.
 */
@Injectable()
export class OllamaProvider implements ILLMProvider {
  private readonly logger = new Logger(OllamaProvider.name);
  private readonly baseUrl: string;
  private readonly model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    this.model = process.env.LLM_MODEL ?? 'llama3.1';
  }

  async generateQuiz(prompt: QuizPrompt): Promise<QuizResponse> {
    const content = await this.complete(QuizPromptBuilder.render(prompt));
    return JSON.parse(this.stripJsonFences(content)) as QuizResponse;
  }

  async suggest(text: string, sentence: string, paragraph: string): Promise<SuggestResponse> {
    const content = await this.complete(SuggestPromptBuilder.build(text, sentence, paragraph));
    return JSON.parse(this.stripJsonFences(content)) as SuggestResponse;
  }

  async generateFlashcard(prompt: FlashcardPrompt): Promise<FlashcardResponse> {
    const content = await this.complete(FlashcardPromptBuilder.build(prompt));
    return JSON.parse(this.stripJsonFences(content)) as FlashcardResponse;
  }

  private async complete(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.response as string;
  }

  private stripJsonFences(content: string): string {
    return content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }
}
