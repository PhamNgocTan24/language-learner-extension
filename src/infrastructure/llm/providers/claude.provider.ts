import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ILLMProvider, QuizPrompt, QuizResponse } from '../../../domain/services/llm/llm.interface';
import { QuizPromptBuilder } from '../../../domain/services/llm/quiz-prompt.builder';

/**
 * Claude (Anthropic) provider — production.
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
    const text = QuizPromptBuilder.render(prompt);
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      messages: [{ role: 'user', content: text }],
    });

    const content = message.content[0];
    if (content.type !== 'text') throw new Error('Unexpected Claude response type');
    return JSON.parse(content.text) as QuizResponse;
  }

  async suggestCategory(text: string): Promise<string> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 20,
      messages: [
        {
          role: 'user',
          content: `Classify this English text into ONE of: Vocabulary, Phrase, Grammar, Idiom, Pronunciation.
Text: "${text}"
Respond with only the category name, nothing else.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') return 'Vocabulary';
    return content.text.trim();
  }
}
