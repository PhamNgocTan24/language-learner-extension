import { Injectable, Logger } from '@nestjs/common';
import { ILLMProvider, QuizPrompt, QuizResponse } from '../../../domain/services/llm/llm.interface';
import { QuizPromptBuilder } from '../../../domain/services/llm/quiz-prompt.builder';

/**
 * Groq provider — uses direct fetch instead of groq-sdk to avoid
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
      `Groq init — key: ${this.apiKey ? this.apiKey.slice(0, 8) + '...' : 'MISSING'}, model: ${this.model}`,
    );
  }

  async generateQuiz(prompt: QuizPrompt): Promise<QuizResponse> {
    const content = await this.complete(QuizPromptBuilder.render(prompt), 512, 0.3);
    // Strip markdown code fences if the model wraps the JSON
    const json = content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();
    return JSON.parse(json) as QuizResponse;
  }

  async suggestCategory(text: string): Promise<string> {
    const content = await this.complete(
      `Classify this English text into ONE of: Vocabulary, Phrase, Grammar, Idiom, Pronunciation.\nText: "${text}"\nRespond with only the category name, nothing else.`,
      20,
      0,
    );
    return content.trim();
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
}
