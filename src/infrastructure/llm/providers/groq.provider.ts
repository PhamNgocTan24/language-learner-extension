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
 * Groq provider - uses direct fetch instead of groq-sdk to avoid
 * Node.js runtime compatibility issues with the SDK's HTTP client.
 */
@Injectable()
export class GroqProvider implements ILLMProvider {
  private readonly logger = new Logger(GroqProvider.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY ?? '';
    this.model = process.env.LLM_MODEL ?? 'llama-3.3-70b-versatile';
    this.logger.log(
      `Groq init - key: ${this.apiKey ? this.apiKey.slice(0, 8) + '...' : 'MISSING'}, model: ${this.model}`,
    );
  }

  async generateQuiz(prompt: QuizPrompt): Promise<QuizResponse> {
    const content = await this.complete(QuizPromptBuilder.render(prompt), 512, 0.3);
    return JSON.parse(this.stripJsonFences(content)) as QuizResponse;
  }

  async suggest(text: string, sentence: string, paragraph: string): Promise<SuggestResponse> {
    const content = await this.complete(
      SuggestPromptBuilder.build(text, sentence, paragraph),
      160,
      0,
    );
    return JSON.parse(this.stripJsonFences(content)) as SuggestResponse;
  }

  async generateFlashcard(prompt: FlashcardPrompt): Promise<FlashcardResponse> {
    const content = await this.complete(FlashcardPromptBuilder.build(prompt), 320, 0.2);
    return JSON.parse(this.stripJsonFences(content)) as FlashcardResponse;
  }

  private async complete(
    userContent: string,
    maxTokens: number,
    temperature: number,
  ): Promise<string> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: userContent }],
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Groq API ${res.status}: ${body}`);
    }

    const data = (await res.json()) as any;
    return data.choices?.[0]?.message?.content ?? '';
  }

  private stripJsonFences(content: string): string {
    return content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }
}
