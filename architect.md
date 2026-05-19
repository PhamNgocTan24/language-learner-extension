# Technical Architecture Document
## LearnClip

**Version:** 1.0  
**Stack:** NestJS + TypeScript + Next.js + PostgreSQL + Redis  
**LLM Strategy:** Provider abstraction — Ollama (dev) → Groq (POC) → Claude API (prod)  
**Last Updated:** May 2026

---

## 1. System Overview

```
┌─────────────────────┐     HTTPS      ┌──────────────────────┐
│   Chrome Extension  │ ─────────────▶ │    NestJS API        │
│   (Vanilla JS)      │                │    (Railway/Render)   │
└─────────────────────┘                └──────────┬───────────┘
                                                   │
                              ┌────────────────────┼─────────────────────┐
                              │                    │                     │
                    ┌─────────▼──────┐   ┌─────────▼──────┐   ┌────────▼───────┐
                    │  PostgreSQL    │   │     Redis       │   │  LLM Provider  │
                    │  (Supabase)    │   │   (Upstash)     │   │  (Abstracted)  │
                    └────────────────┘   └────────────────┘   └────────────────┘

┌─────────────────────┐     HTTPS
│   Next.js Website   │ ─────────────▶  NestJS API (same)
│   (Vercel)          │
└─────────────────────┘
```

---

## 2. Components

### 2.1 Chrome Extension (Input Layer)

**Tech:** Manifest V3, Vanilla JS (no framework — keeps bundle small)

**Files:**
```
extension/
├── manifest.json
├── content.js       → runs on every page, listens for highlight
├── background.js    → service worker, handles API calls
├── popup.html       → minimal UI (save button, category confirm)
├── popup.js
└── styles.css
```

**Flow:**
```
1. User highlights text
2. content.js fires on mouseup
3. Captures:
   - window.getSelection().toString()        → selected text
   - selection.anchorNode.parentElement      → parent element
   - element.closest('p')?.innerText        → paragraph context
   - document.title + window.location.href  → source metadata
4. Shows floating save button near selection
5. User clicks save → category suggestion request to API
6. User confirms category → POST /saves
7. Toast notification → done (no redirect)
```

**Permissions requested (minimal):**
```json
{
  "permissions": ["activeTab", "storage"],
  "host_permissions": ["https://your-api.com/*"]
}
```

> Only `activeTab` — reads page content only at the exact moment of user action. Not passive background reading. This keeps the permission prompt non-scary.

---

### 2.2 NestJS API

**Architecture reference:** inspired by [nestjs-clean-architecture](https://github.com/CollatzConjecture/nestjs-clean-architecture)

**What we take from it:** 4-layer separation + Repository Pattern + dependency direction rule.
**What we skip for POC:** CQRS, Event Sourcing, Sagas, Prometheus — overkill for a solo founder POC.

**Dependency direction rule (never break this):**
```
Infrastructure → Application → Domain
                API → Application

Domain knows nothing about NestJS, databases, or HTTP.
```

**Module structure:**
```
src/
├── main.ts
├── app.module.ts
│
├── api/                              # HTTP Layer — controllers & DTOs only
│   ├── controllers/
│   │   ├── auth.controller.ts        → POST /auth/google, /auth/refresh
│   │   ├── saves.controller.ts       → POST /saves, GET /saves, DELETE /saves/:id
│   │   ├── quiz.controller.ts        → POST /quiz/generate/:saveId, POST /quiz/:id/answer
│   │   ├── users.controller.ts       → GET /users/me, PATCH /users/me
│   │   └── payments.controller.ts    → POST /payments/checkout, POST /payments/webhook
│   ├── dto/
│   │   ├── saves/
│   │   │   ├── create-save.dto.ts    → text, sentence, paragraph, sourceUrl, sourceTitle
│   │   │   └── save-response.dto.ts
│   │   ├── quiz/
│   │   │   ├── answer-quiz.dto.ts
│   │   │   └── quiz-response.dto.ts
│   │   └── users/
│   │       └── update-user.dto.ts    → level, goal
│   └── api.module.ts
│
├── application/                      # Orchestration Layer — business flow
│   ├── auth/
│   │   ├── auth.service.ts           → Google OAuth, JWT issue/refresh
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── google.strategy.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── auth.module.ts
│   ├── services/
│   │   ├── saves.service.ts          → orchestrate save creation + limit check
│   │   ├── quiz.service.ts           → orchestrate quiz generation + answer scoring
│   │   ├── users.service.ts          → profile read/update
│   │   └── payments.service.ts       → Stripe checkout + webhook handling
│   └── application.module.ts
│
├── domain/                           # Pure Business Logic — no NestJS, no DB, no HTTP
│   ├── entities/
│   │   ├── user.entity.ts            → id, email, level, goal, tier
│   │   ├── save.entity.ts            → text, sentence, paragraph, source, category
│   │   └── quiz.entity.ts            → question, options, correct, explanation, userAnswer
│   ├── interfaces/
│   │   └── repositories/
│   │       ├── user.repository.interface.ts
│   │       ├── save.repository.interface.ts
│   │       └── quiz.repository.interface.ts
│   └── services/
│       ├── save-limit.domain.service.ts    → free tier rule: 20 saves/month
│       ├── difficulty.domain.service.ts    → level adaptation logic
│       └── llm/
│           ├── llm.interface.ts            → ILLMProvider contract
│           └── quiz-prompt.builder.ts      → build prompt from save + user level
│
└── infrastructure/                   # External World — DB, LLM, Redis, Stripe
    ├── database/
    │   ├── database.module.ts
    │   └── migrations/
    ├── repositories/                 → implements domain interfaces
    │   ├── user.repository.ts
    │   ├── save.repository.ts
    │   └── quiz.repository.ts
    ├── llm/
    │   ├── llm.module.ts             → reads LLM_PROVIDER env, injects correct provider
    │   ├── llm.service.ts            → retry + JSON validation wrapper
    │   └── providers/
    │       ├── ollama.provider.ts    → dev
    │       ├── groq.provider.ts      → POC
    │       └── claude.provider.ts    → prod
    ├── redis/
    │   └── redis.module.ts           → save counter, quiz cache, rate limiting
    └── payments/
        └── stripe.service.ts         → Stripe SDK wrapper
```

**The rule that keeps this clean:**
- `api/` only imports from `application/`
- `application/` only imports from `domain/` interfaces
- `infrastructure/` implements `domain/` interfaces — injected via DI
- `domain/` imports nothing — pure TypeScript classes only

---

### 2.3 LLM Provider Abstraction

**Interface — never changes:**
```typescript
// llm/llm.interface.ts
export interface QuizPrompt {
  word: string;
  sentence: string;
  paragraph: string;
  sourceTitle: string;
  userLevel: 'A2' | 'B1' | 'B2' | 'C1';
  category: string;
}

export interface QuizResponse {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface ILLMProvider {
  generateQuiz(prompt: QuizPrompt): Promise<QuizResponse>;
  suggestCategory(text: string): Promise<string>;
}
```

**Provider switching via env:**
```typescript
// llm/llm.module.ts
const providerMap = {
  ollama: OllamaProvider,
  groq: GroqProvider,
  claude: ClaudeProvider,
};

@Module({
  providers: [
    {
      provide: 'LLM_PROVIDER',
      useClass: providerMap[process.env.LLM_PROVIDER ?? 'ollama'],
    },
    LlmService,
  ],
  exports: ['LLM_PROVIDER', LlmService],
})
export class LlmModule {}
```

**Retry + JSON validation wrapper:**
```typescript
// llm/llm.service.ts
@Injectable()
export class LlmService {
  constructor(@Inject('LLM_PROVIDER') private provider: ILLMProvider) {}

  async generateQuiz(prompt: QuizPrompt): Promise<QuizResponse> {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const result = await this.provider.generateQuiz(prompt);
        if (this.isValidQuiz(result)) return result;
      } catch {
        if (attempt === 3) throw new Error('LLM failed after 3 attempts');
      }
    }
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
}
```

**Quiz generation prompt:**
```typescript
// Inside GroqProvider / ClaudeProvider
private buildPrompt(p: QuizPrompt): string {
  return `
You are an English learning assistant.
User level: ${p.userLevel}. Category: ${p.category}.

The user saved this while reading:
Word/Phrase: "${p.word}"
Full sentence: "${p.sentence}"
Paragraph context: "${p.paragraph}"
Source: "${p.sourceTitle}"

Generate 1 multiple-choice question to test understanding.
Respond ONLY with valid JSON. No markdown. No explanation outside JSON.

{
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct": "A",
  "explanation": "..."
}`;
}
```

---

### 2.4 Next.js Website

**Pages:**
```
app/
├── page.tsx                  → landing page
├── onboarding/
│   └── page.tsx              → 3-step onboarding flow
├── dashboard/
│   ├── page.tsx              → saved items list
│   └── quiz/
│       └── [saveId]/
│           └── page.tsx      → quiz interface for a specific save
├── settings/
│   └── page.tsx              → level, subscription, account
└── api/                      → Next.js API routes (thin proxy to NestJS)
```

**Deployment:** Vercel (free tier, auto-deploy from main branch)

---

## 3. Database Schema

```sql
-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       VARCHAR(255) UNIQUE NOT NULL,
  name        VARCHAR(255),
  avatar_url  TEXT,
  level       VARCHAR(5) DEFAULT 'B1',   -- A2 | B1 | B2 | C1
  goal        VARCHAR(50),               -- read_news | work | ielts
  tier        VARCHAR(20) DEFAULT 'free', -- free | pro | lifetime
  stripe_customer_id VARCHAR(255),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Saved highlights
CREATE TABLE saves (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  text         TEXT NOT NULL,             -- highlighted text
  sentence     TEXT,                      -- full sentence context
  paragraph    TEXT,                      -- paragraph context
  source_url   TEXT,
  source_title TEXT,
  category     VARCHAR(50),               -- Vocabulary | Phrase | Grammar | Idiom | Pronunciation
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE quizzes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  save_id       UUID REFERENCES saves(id) ON DELETE CASCADE,
  question      TEXT NOT NULL,
  options       JSONB NOT NULL,            -- ["A. ...", "B. ...", ...]
  correct       VARCHAR(5) NOT NULL,
  explanation   TEXT,
  user_answer   VARCHAR(5),               -- null if not answered yet
  is_correct    BOOLEAN,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_saves_user_id ON saves(user_id);
CREATE INDEX idx_saves_created_at ON saves(created_at DESC);
CREATE INDEX idx_quizzes_user_id ON quizzes(user_id);
```

---

## 4. Redis Usage (Upstash)

```
Key pattern                          TTL        Purpose
─────────────────────────────────────────────────────────────
saves:count:{userId}:{YYYY-MM}      30 days    Free tier save counter (20/month limit)
quiz:cache:{saveId}:{level}         7 days     Cache generated quiz (avoid duplicate LLM calls)
session:{token}                     24 hours   JWT session (optional)
ratelimit:{userId}                  1 min      API rate limiting
```

**Free tier enforcement:**
```typescript
async checkSaveLimit(userId: string): Promise<boolean> {
  const key = `saves:count:${userId}:${format(new Date(), 'yyyy-MM')}`;
  const count = await this.redis.incr(key);
  if (count === 1) await this.redis.expire(key, 60 * 60 * 24 * 30);
  return count <= 20; // free tier limit
}
```

---

## 5. API Endpoints

```
Auth
POST   /auth/google              → Google OAuth callback
POST   /auth/refresh             → Refresh JWT token
DELETE /auth/logout

Saves
POST   /saves                    → Create new save (extension calls this)
GET    /saves                    → List user's saves (paginated)
DELETE /saves/:id                → Delete a save
POST   /saves/suggest-category   → LLM auto-suggest category for text

Quiz
POST   /quiz/generate/:saveId    → Generate MCQ for a specific save (on demand)
POST   /quiz/:quizId/answer      → Submit user's answer
GET    /quiz/history             → User's quiz history

Users
GET    /users/me                 → Current user profile
PATCH  /users/me                 → Update level, goal
GET    /users/me/stats           → Quiz stats, streak, accuracy

Payments
POST   /payments/checkout        → Create Stripe checkout session
POST   /payments/webhook         → Stripe webhook (subscription events)
GET    /payments/portal          → Stripe customer portal URL
```

---

## 6. LLM Provider Environments

```bash
# .env.development
LLM_PROVIDER=ollama
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=llama3.1

# .env.staging (POC with real users)
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_...
LLM_MODEL=llama-3.1-70b-versatile

# .env.production
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=claude-sonnet-4-20250514
```

Switch provider: change one env variable, redeploy. Zero code change.

---

## 7. Infrastructure

| Service | Provider | Tier | Est. Cost |
|---|---|---|---|
| API server | Railway or Render | Free tier | $0 |
| Website | Vercel | Free tier | $0 |
| PostgreSQL | Supabase | Free tier (500MB) | $0 |
| Redis | Upstash | Free tier (10k req/day) | $0 |
| LLM (dev) | Ollama | Local | $0 |
| LLM (POC) | Groq | Free tier | $0 |
| LLM (prod) | Claude API | Pay per use | ~$5-20/month |
| Payments | Stripe | 2.9% + $0.30/txn | $0 until revenue |
| **Total (POC)** | | | **$0/month** |

---

## 8. Build Sequence (Solo Founder — 6 Weeks)

**Week 1 — Foundation**
- NestJS project setup, module scaffold
- PostgreSQL schema + migrations (TypeORM)
- Google OAuth + JWT auth
- Upstash Redis connection

**Week 2 — Core API**
- `POST /saves` endpoint
- Save counter (free tier enforcement)
- LLM abstraction layer + OllamaProvider
- Quiz generation endpoint with retry logic

**Week 3 — Chrome Extension**
- Manifest V3 setup
- Content script: highlight detection + context capture
- Popup UI: category confirm + save button
- Connect extension to API

**Week 4 — Website V1**
- Next.js setup + Vercel deploy
- Google OAuth login flow
- Saved items list page
- Quiz interface page

**Week 5 — Onboarding + Payments**
- 3-step onboarding flow
- Stripe checkout + webhook
- Free tier upgrade prompt
- GroqProvider implementation (switch from Ollama for POC)

**Week 6 — Polish + Launch**
- End-to-end testing of full flow
- Error handling, loading states
- Privacy policy + terms
- Post in first communities

---

## 9. Key Technical Decisions & Rationale

| Decision | Choice | Reason |
|---|---|---|
| Extension framework | Vanilla JS | No framework overhead for a small popup UI |
| Extension context capture | On highlight only | Avoids scary permissions, respects privacy |
| Quiz generation trigger | On demand (not on save) | Only pay LLM cost when user is engaged |
| LLM architecture | Provider abstraction (Strategy Pattern) | Swap providers freely without code change |
| LLM for POC | Groq (free) | Zero cost, fast enough for validation |
| Database | PostgreSQL via Supabase | Familiar, relational, free tier generous |
| Cache | Redis via Upstash | Save counter, quiz cache, rate limiting |
| Frontend | Next.js on Vercel | SEO-ready, free hosting, fast deploy |
| Payments | Stripe | Industry standard, easy webhooks |

---

## 10. Security Considerations

- JWT tokens with short expiry (15min access + 7d refresh)
- Extension only sends data to your own API domain (CSP in manifest)
- User data scoped strictly by `user_id` on every query
- Stripe webhooks validated with signature secret
- LLM prompts never include raw user credentials or PII
- Rate limiting on all public endpoints via Redis
