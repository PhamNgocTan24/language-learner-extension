import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
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
 * Claude (Anthropic) provider - production.
 * Uses the official @anthropic-ai/sdk.
 */
@Injectable()
export class ClaudeProvider implements ILLMProvider {
  private readonly logger = new Logger(ClaudeProvider.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.model = process.env.LLM_MODEL ?? 'claude-sonnet-4-20250514';
  }

  async generateQuiz(prompt: QuizPrompt): Promise<QuizResponse> {
    const content = await this.complete(QuizPromptBuilder.render(prompt), 512);
    return JSON.parse(this.stripJsonFences(content)) as QuizResponse;
  }

  async suggest(text: string, sentence: string, paragraph: string): Promise<SuggestResponse> {
    const content = await this.complete(SuggestPromptBuilder.build(text, sentence, paragraph), 160);
    return JSON.parse(this.stripJsonFences(content)) as SuggestResponse;
  }

  async generateFlashcard(prompt: FlashcardPrompt): Promise<FlashcardResponse> {
    const content = await this.complete(FlashcardPromptBuilder.build(prompt), 320);
    return JSON.parse(this.stripJsonFences(content)) as FlashcardResponse;
  }

  private async complete(text: string, maxTokens: number): Promise<string> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: text }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected Claude response type');
    return content.text;
  }

  private stripJsonFences(content: string): string {
    return content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
  }
}
