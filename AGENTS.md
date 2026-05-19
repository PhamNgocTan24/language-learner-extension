# AGENTS.md — LearnClip

NestJS + TypeScript backend API for an English learning Chrome extension.
Clean Architecture (4 layers) + Repository Pattern + LLM provider abstraction.

---

## Commands

```bash
# Development
pnpm run start:dev          # start API in watch mode (WSL)
pnpm run build              # compile TypeScript

# Database
pnpm run migration:generate -- src/infrastructure/database/migrations/MigrationName
pnpm run migration:run
pnpm run migration:revert

# Test
pnpm run test               # unit tests
pnpm run test:e2e           # end-to-end tests
pnpm run test:cov           # coverage report

# Lint — always run after changes, do not rely on Claude to enforce style
pnpm run lint
pnpm run lint:fix
```

---

## Architecture — 4 Layers (strictly enforced)

```
api/ → application/ → domain/ ← infrastructure/
```

| Layer | Location | Responsibility |
|---|---|---|
| API | `src/api/` | HTTP only — controllers, DTOs, pipes |
| Application | `src/application/` | Orchestration — services, guards, strategies |
| Domain | `src/domain/` | Pure business logic — entities, interfaces, domain services |
| Infrastructure | `src/infrastructure/` | External — DB repositories, LLM providers, Redis, Stripe |

**Hard rules — never break these:**
- `domain/` imports nothing from NestJS, TypeORM, or any infrastructure package
- `api/` never imports directly from `infrastructure/` or `domain/`
- `application/` services depend only on `domain/` interfaces, injected via DI
- Business logic (free tier limit, difficulty rules, prompt building) lives in `domain/services/`, not in application services or controllers

---

## Repository Pattern

Domain defines the contract. Infrastructure implements it.

```typescript
// domain/interfaces/repositories/save.repository.interface.ts
export interface ISaveRepository {
  create(save: SaveEntity): Promise<SaveEntity>;
  findByUserId(userId: string, options?: PaginationOptions): Promise<SaveEntity[]>;
  countByUserAndMonth(userId: string, year: number, month: number): Promise<number>;
  deleteById(id: string): Promise<void>;
}

// infrastructure/repositories/save.repository.ts
@Injectable()
export class SaveRepository implements ISaveRepository { ... }

// Injection token — always use string tokens for repository interfaces
{ provide: 'SAVE_REPOSITORY', useClass: SaveRepository }
```

When adding a new feature:
1. Define the entity in `domain/entities/`
2. Define the repository interface in `domain/interfaces/repositories/`
3. Implement in `infrastructure/repositories/`
4. Register the token in `infrastructure/database/database.module.ts`

---

## LLM Provider — Strategy Pattern

Never call a provider directly from application services. Always go through `LlmService`.

```typescript
// Swap provider by changing .env only — zero code change
LLM_PROVIDER=ollama   # local dev
LLM_PROVIDER=groq     # POC / staging
LLM_PROVIDER=claude   # production
```

New provider checklist:
- Implement `ILLMProvider` from `domain/services/llm/llm.interface.ts`
- Place in `infrastructure/llm/providers/`
- Register in `infrastructure/llm/llm.module.ts` provider map
- Never add provider-specific logic outside `infrastructure/llm/`

`LlmService` handles retry (3 attempts) and JSON validation — do not add retry logic elsewhere.

**`LlmModule` uses `useFactory` to instantiate the provider — not `useClass`.** This is required because `process.env.LLM_PROVIDER` is `undefined` at module parse time (before `ConfigModule` runs). `useFactory` runs after env is loaded.

---

## Domain Services — Where Business Rules Live

| File | Rule it owns |
|---|---|
| `save-limit.domain.service.ts` | Free tier: 20 saves/month per user |
| `difficulty.domain.service.ts` | Level adaptation: nudge up after 5 days 90%+, nudge down after 50%- |
| `llm/quiz-prompt.builder.ts` | Build LLM prompt from SaveEntity + user level |

When adding a new business rule, ask: does this belong in domain? If it has no HTTP, no DB, no external dependency — it goes in `domain/services/`.

---

## DTOs

- Validate all incoming HTTP data with `class-validator` decorators — no raw `req.body`
- Response DTOs live in `api/dto/` — never expose raw entities to HTTP layer
- Use `plainToInstance` + `ClassSerializerInterceptor` to transform responses

```typescript
// api/dto/saves/save-response.dto.ts
export class SaveResponseDto {
  id: string;
  text: string;
  category: string;
  createdAt: Date;
  // never expose: userId, raw paragraph, internal fields
}
```

---

## Database Conventions

- ORM: TypeORM with PostgreSQL (Supabase)
- All entities extend a `BaseEntity` with `id` (UUID), `createdAt`, `updatedAt`
- IDs are UUID v4 — never auto-increment integers
- Always create a migration for schema changes — never use `synchronize: true` outside local dev
- Soft deletes: use `@DeleteDateColumn()` for user data, hard delete only for quiz attempts

---

## Redis Conventions (Upstash)

Key naming: `{resource}:{action}:{identifier}:{scope}`

```
saves:count:{userId}:{YYYY-MM}     → free tier monthly counter
quiz:cache:{saveId}:{level}        → cached LLM quiz output
ratelimit:{userId}                 → API rate limit
```

Always set TTL explicitly. Never leave a Redis key without expiry.

---

## Error Handling

- Use NestJS built-in exceptions (`NotFoundException`, `ForbiddenException`, etc.)
- Domain services throw plain `Error` — application layer catches and maps to HTTP exceptions
- LLM failures: catch in `LlmService`, throw `ServiceUnavailableException` after 3 failed retries
- Never expose internal error messages to HTTP responses in production

---

## Environment Variables

All secrets via `.env`. Never hardcode. Required variables:

```
DATABASE_URL
REDIS_URL
JWT_SECRET
JWT_REFRESH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
LLM_PROVIDER          # ollama | groq | claude
LLM_MODEL
GROQ_API_KEY          # if LLM_PROVIDER=groq
ANTHROPIC_API_KEY     # if LLM_PROVIDER=claude
OLLAMA_BASE_URL       # if LLM_PROVIDER=ollama
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

---

## What NOT To Do

- Do not put business logic in controllers or DTOs
- Do not import `TypeORM` entities into `domain/` layer
- Do not call LLM providers directly — always use `LlmService`
- Do not use `synchronize: true` in TypeORM config outside local dev
- Do not return raw TypeORM entities from controllers — use DTOs
- Do not add a new LLM provider without implementing `ILLMProvider` fully
- Do not store LLM raw responses — always parse and validate JSON before persisting
- Do not use `useClass` to register `LLM_PROVIDER` in `LlmModule` — use `useFactory` so env vars are available at instantiation time
