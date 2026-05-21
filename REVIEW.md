# REVIEW.md - LearnClip PR Review Guidelines

Read this together with `AGENTS.md` before reviewing any PR.

LearnClip currently has 3 main parts:
- NestJS + TypeScript backend in `src/`
- Next.js frontend in `web/`
- Chrome extension in `extension/`

References: sanyuan0704/code-review-expert, bobmatnyc/ai-code-review, baz-scm/awesome-reviewers, Nikita-Filonov/ai-review.

---

## Step 1 - Scope Changes First

Run these commands before starting a review:

```bash
git status -sb
git diff --stat
git diff
rg "<function_name>" src/ web/ extension/
```

**Edge cases:**
- **Empty diff** -> tell the user and ask whether they want to review staged changes or a commit range.
- **Diff > 500 lines** -> summarize by file first, then review in batches by module/feature.
- **Mixed concerns** -> group findings by logical feature, not by file order.

**Always identify affected critical paths:**
- Auth flow: JWT, Google OAuth, cookie/token handling
- Payment flow: Stripe checkout, portal, webhook, subscription check
- Data writes: save operation, quiz answer, user settings
- LLM calls: prompt building, provider call, JSON validation, retry/cache
- Extension boundary: message passing, content script DOM access, permissions

---

## Step 2 - Explore Related Files

Do not review based on the diff alone. For each changed file, read the related files:

| Changed file | Also read |
|---|---|
| `src/application/services/*.service.ts` | Interfaces in `src/domain/interfaces/` + called domain services |
| `src/api/controllers/*.controller.ts` | Corresponding DTOs + called application service |
| `src/api/dto/**/*.ts` | Controller using the DTO + web/extension response contract if applicable |
| `src/domain/entities/*.entity.ts` | Repository interface + related mapper/repository |
| `src/domain/services/**/*.ts` | Application service calling the domain service + unit tests if present |
| `src/infrastructure/repositories/*.ts` | Interface it implements + related ORM entity |
| `src/infrastructure/database/orm-entities/*.orm-entity.ts` | Related repository + migration if there is a schema change |
| `src/infrastructure/llm/providers/*.ts` | `src/domain/services/llm/llm.interface.ts` + `llm.service.ts` |
| `web/app/**/*.tsx` | Server Actions in `web/app/actions/` + shared types in `web/lib/` |
| `web/components/**/*.tsx` | Call sites + token/style rules in `web/app/globals.css` |
| `extension/*.js` | `manifest.json` + related message sender/receiver |

**Schema change rule:** If a PR changes an ORM entity, it must include a matching migration. The repo currently does not have a default migrations folder; if a schema change lacks a migration, flag it as a finding.

---

## Review Modes

If the review tool supports command modes, use these modes. The command prefix may vary by tool (`review`, `@codex review`, `@claude review`), but the focus should stay the same:

| Command | Focus |
|---|---|
| `review` | Full review - all categories |
| `review --security` | Security only |
| `review --arch` | Clean Architecture + SOLID only |
| `review --perf` | Performance + Lambda/runtime cost only |
| `review --cleanup` | Dead code + removal candidates only |
| `review --quick` | P0 blockers only |

---

## Priority System

| Level | Meaning | Action |
|---|---|---|
| **P0 - Critical** | Security breach, data loss, production crash | Block merge completely |
| **P1 - High** | Architecture violation, serious logic error | Must fix before merge |
| **P2 - Medium** | Code smell, missing best practice, risky edge case | Should fix; may merge with a clear reason |
| **P3 - Low** | Suggestion, small optimization | Optional; author decides |

---

## Finding Format

```markdown
[P{0-3}] [CATEGORY-###] [Confidence: HIGH|MED|LOW]

**Issue:** Short description.
**Location:** `src/path/to/file.ts` line X
**Why:** Why this is a problem.
**Fix:** Concrete code snippet or clear fix direction.
```

Example:

[P1] [ARCH-003] [Confidence: HIGH]

**Issue:** `SavesService` imports an infrastructure repository directly instead of using a domain interface.
**Location:** `src/application/services/saves.service.ts` line 8
**Why:** This violates the dependency rule: the application layer must not depend on infrastructure.
**Fix:**

```ts
// Wrong
import { SaveRepository } from '../../infrastructure/repositories/save.repository';

// Correct
@Inject('SAVE_REPOSITORY') private readonly saveRepo: ISaveRepository
```

---

## Category IDs

| ID | Category |
|---|---|
| ARCH | Clean Architecture / dependency rule |
| SOLID | SOLID principle violation |
| SEC | Security |
| PERF | Performance / Lambda/runtime cost |
| DATA | Database / migration / persistence correctness |
| LLM | LLM integration / prompt / provider abstraction |
| API | HTTP / DTO / response contract |
| WEB | Next.js frontend / Server Actions / UI contract |
| EXT | Chrome extension / manifest / content script |
| DEAD | Dead code / removal candidate |

---

## SOLID Checklist

Check each principle for every new or changed class/service.

**SRP - Single Responsibility**
- [ ] Class/service has only one reason to change
- [ ] `saves.service.ts` does not handle both limit validation and LLM prompt building
- Violation signals: method > 20 lines, class > 200 lines, many unrelated imports

**OCP - Open/Closed**
- [ ] Adding a new LLM provider does not require changing `LlmService`
- [ ] Adding a new category does not require changing quiz generation logic when the category is only data
- Violation signal: `if provider === 'groq' ... else if provider === 'claude'` in business logic

**LSP - Liskov Substitution**
- [ ] `GroqProvider`, `OllamaProvider`, and `ClaudeProvider` are all substitutable for `ILLMProvider`
- [ ] Repository implementations are substitutable for their domain interfaces
- Violation signal: implementation throws for a required interface method

**ISP - Interface Segregation**
- [ ] `ILLMProvider` does not force implementations to provide unused methods
- [ ] Repository interfaces do not contain methods needed by only one special implementation
- Violation signal: `implements ISomething` but a method is empty or throws `NotImplemented`

**DIP - Dependency Inversion**
- [ ] Application services depend on `src/domain/interfaces/`, not implementations
- [ ] Dependencies are injected through DI tokens, not `new ConcreteClass()` in the application layer
- Violation signal: import from `src/infrastructure/` inside `src/application/`

---

## Architecture Checklist

```text
api/ -> application/ -> domain/ <- infrastructure/
```

- [ ] `src/domain/` does not import NestJS, TypeORM, or infrastructure packages
- [ ] `src/api/` does not import directly from `src/infrastructure/` or `src/domain/`
- [ ] `src/application/services/` does not import from `src/infrastructure/`
- [ ] Controllers do not call repositories directly
- [ ] New business rules live in `src/domain/services/`
- [ ] LLM calls go through `LlmService`; providers are not called directly
- [ ] Free tier check (`save-limit.domain.service`) runs before every save
- [ ] Repository interfaces live in domain; implementations live in infrastructure
- [ ] Repository interface injection uses string DI tokens
- [ ] `LlmModule` registers `LLM_PROVIDER` with `useFactory`, not `useClass`

---

## Security Checklist

**Injection & Input**
- [ ] Input is validated with `class-validator`; raw bodies are not trusted
- [ ] Queries use TypeORM parameterized APIs, not string concatenation
- [ ] LLM prompts sanitize/quote user input before injecting it into the prompt

**Auth & Authorization**
- [ ] Endpoints requiring auth use `@UseGuards(JwtAuthGuard)`
- [ ] All user-owned data queries filter by `userId`
- [ ] Stripe webhook validates the `stripe-signature` header
- [ ] Web/extension code does not leak tokens through logs, query strings, or unnecessary DOM exposure

**Data Exposure**
- [ ] Responses use DTOs; raw ORM/domain entities are not exposed
- [ ] Tokens, secrets, sensitive webhook payloads, and PII are not logged
- [ ] Error messages do not expose stack traces/internal details in production

**Supply Chain**
- [ ] New dependencies are reviewed for purpose, maintainer, and typosquatting risk
- [ ] No packages are pulled from untrusted sources

---

## Database Checklist

- [ ] ORM entities follow base conventions: UUID id, `createdAt`, `updatedAt`
- [ ] User data uses soft delete when logical deletion is needed
- [ ] Hard delete is used only for allowed data, such as quiz attempts under the current guideline
- [ ] Schema changes include a migration
- [ ] `synchronize: true` is not enabled for production/runtime deploys
- [ ] Repositories clearly map ORM entities to domain entities and do not leak ORM entities to the API

---

## LLM Checklist

- [ ] New providers fully implement `ILLMProvider`
- [ ] Provider-specific logic exists only in `src/infrastructure/llm/providers/`
- [ ] Application code calls only `LlmService`
- [ ] Retry/JSON validation exists only in `LlmService`; it is not duplicated elsewhere
- [ ] Raw LLM responses are not persisted before parsing/validation
- [ ] Prompt-building business logic lives in `src/domain/services/llm/`
- [ ] Quiz cache uses Redis key `quiz:cache:{saveId}:{level}` and has a TTL

---

## Performance Checklist

- [ ] Heavy objects/clients are initialized at module/provider level when reuse is possible, not per request
- [ ] Database connection pooling is appropriate for the runtime
- [ ] LLM responses are cached in Redis when generating the same quiz again
- [ ] No N+1 queries, especially DB calls inside loops
- [ ] Redis keys have explicit TTLs
- [ ] Lambda/serverless paths do not bundle unnecessary large assets/packages

---

## Web Checklist (`web/`)

The project uses Next.js App Router and Tailwind v4.

- [ ] No `fetch()` in client components; use Server Components, Server Actions, or Route Handlers
- [ ] Do not use `<img>`; use `next/image`
- [ ] Colors use tokens from the `@theme` block in `web/app/globals.css`
- [ ] Do not create `tailwind.config.ts`; this project uses Tailwind v4 with `@import "tailwindcss"`
- [ ] `@source` in `web/app/globals.css` still covers `web/app/` and `web/components/`
- [ ] `'use client'` appears only when event handlers, state, or browser APIs are needed
- [ ] Shared API types in `web/lib/types.ts` match backend DTO responses
- [ ] Loading states use route-segment `loading.tsx` where appropriate
- [ ] Red is used only for wrong answers and error states
- [ ] API URL comes from `process.env.NEXT_PUBLIC_API_URL`; production URLs are not hardcoded

---

## Extension Checklist (`extension/`)

- [ ] `manifest.json` requests only necessary permissions and host permissions
- [ ] No secrets/API keys are hardcoded in extension JavaScript
- [ ] API base URL/config is consistent with the backend/web environment strategy
- [ ] Message passing between `content.js`, `background.js`, and `popup.js` validates action/payload
- [ ] Content scripts do not inject unsanitized HTML into pages
- [ ] DOM selection/text extraction handles empty selection and large text safely
- [ ] Tokens/sessions are not logged to the console and are not stored in unnecessarily leak-prone locations
- [ ] Background script handles network failure and auth expiration clearly

---

## Removal Candidates

For every PR, also scan:

```bash
rg "TODO|FIXME|DEPRECATED|@unused" src/ web/ extension/
git log --diff-filter=D --summary
```

Classify findings:
- **Safe delete now** - code is not referenced and tests/lint would still pass if removed
- **Defer with plan** - code may be needed later and must have a clear comment/issue
- **Feature-flagged off** - code is behind a branch/env flag that can never be true

---

## No Need To Comment

- Code style or indentation; ESLint + Prettier handle it
- Missing JSDoc; this project does not require it
- Standard short variable names such as `req`, `res`, `dto`, `ctx`, `err`
- Low test coverage outside the domain layer during the POC stage, unless the change touches a critical path
- "Consider using X" comments without a concrete reason and impact

---

## Required Summary Format

```markdown
## Code Review Summary

**Files reviewed:** X files, Y lines changed
**Critical paths affected:** [auth / payments / data / LLM / web / extension / none]

### Findings
| Priority | Count | IDs |
|---|---:|---|
| P0 Critical | X | ARCH-001, SEC-002 |
| P1 High | X | SOLID-001 |
| P2 Medium | X | |
| P3 Low | X | |

### Removal candidates
[none / list]

**Overall:** APPROVE | REQUEST_CHANGES | COMMENT

[1-2 sentence overview]
```
