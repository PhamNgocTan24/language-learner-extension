import { Injectable, Logger } from '@nestjs/common';
import { ILLMProvider, QuizPrompt, QuizResponse } from '../../../domain/services/llm/llm.interface';
import { QuizPromptBuilder } from '../../../domain/services/llm/quiz-prompt.builder';

/**
 * Ollama provider — local dev, no API key required.
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
    const text = QuizPromptBuilder.render(prompt);
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt: text, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.response) as QuizResponse;
  }

  async suggestCategory(text: string): Promise<string> {
    const prompt = `Classify this English text into ONE of: Vocabulary, Phrase, Grammar, Idiom, Pronunciation.
Text: "${text}"
Respond with only the category name, nothing else.`;

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.model, prompt, stream: false }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return (data.response as string).trim();
  }
}
