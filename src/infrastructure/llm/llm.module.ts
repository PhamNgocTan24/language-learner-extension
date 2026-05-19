import { Module } from '@nestjs/common';
import { OllamaProvider } from './providers/ollama.provider';
import { GroqProvider } from './providers/groq.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { LlmService } from './llm.service';

const providerMap: Record<string, any> = {
  ollama: OllamaProvider,
  groq: GroqProvider,
  claude: ClaudeProvider,
};

@Module({
  providers: [
    {
      provide: 'LLM_PROVIDER',
      // useFactory runs AFTER ConfigModule has populated process.env,
      // unlike useClass which is resolved at module parse time.
      useFactory: () => {
        const provider = process.env.LLM_PROVIDER ?? 'ollama';
        const ProviderClass = providerMap[provider];
        if (!ProviderClass) {
          throw new Error(
            `Unknown LLM_PROVIDER: "${provider}". Valid values: ollama, groq, claude`,
          );
        }
        return new ProviderClass();
      },
    },
    LlmService,
  ],
  exports: ['LLM_PROVIDER', LlmService],
})
export class LlmModule {}
