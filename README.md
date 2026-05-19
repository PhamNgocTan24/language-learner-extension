# LearnClip

**Turn Your Reading Into English Mastery**

LearnClip is a Chrome extension + web app that transforms passive English reading into active learning. Highlight text on any webpage, and LearnClip captures it with full context to generate AI-powered exercises — turning every article into a personalized learning session.

---

## 🎯 What It Does

- **Highlight & Save:** Select text on any webpage → extension captures word/phrase + sentence + paragraph + source
- **AI-Powered Categorization:** LLM auto-suggests category (Vocabulary, Phrase, Grammar, Idiom, Pronunciation)
- **On-Demand Quizzes:** Generate multiple-choice questions from your saved items with explanations
- **Adaptive Learning:** System tracks performance and adapts difficulty to your level (A2 → C1)
- **Zero Friction:** No redirect, no interruption — save and keep reading

---

## 🏗️ Architecture

**Stack:** NestJS + TypeScript + Next.js + PostgreSQL + Redis  
**LLM Strategy:** Provider abstraction — Ollama (dev) → Groq (POC) → Claude API (prod)

### Clean Architecture (4 Layers)

```
api/ → application/ → domain/ ← infrastructure/
```

| Layer | Responsibility | Location |
|---|---|---|
| **API** | HTTP only — controllers, DTOs, pipes | `src/api/` |
| **Application** | Orchestration — services, guards, strategies | `src/application/` |
| **Domain** | Pure business logic — entities, interfaces, domain services | `src/domain/` |
| **Infrastructure** | External — DB repositories, LLM providers, Redis, Stripe | `src/infrastructure/` |

**Hard rules:**
- `domain/` imports nothing from NestJS, TypeORM, or any infrastructure package
- `api/` never imports directly from `infrastructure/` or `domain/`
- `application/` services depend only on `domain/` interfaces, injected via DI
- Business logic lives in `domain/services/`, not in application services or controllers

### System Diagram

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

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL (or Supabase account)
- Redis (or Upstash account)
- Ollama (for local LLM development)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd language-learner-extension

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database migrations
pnpm run migration:run

# Start development server
pnpm run start:dev
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/learnclip

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LLM Provider (choose one)
LLM_PROVIDER=ollama              # ollama | groq | claude
LLM_MODEL=llama3.1               # model name
OLLAMA_BASE_URL=http://localhost:11434  # if using Ollama
GROQ_API_KEY=gsk_...             # if using Groq
ANTHROPIC_API_KEY=sk-ant-...     # if using Claude

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📦 Commands

```bash
# Development
pnpm run start:dev          # start API in watch mode
pnpm run build              # compile TypeScript

# Database
pnpm run migration:generate -- src/infrastructure/database/migrations/MigrationName
pnpm run migration:run
pnpm run migration:revert

# Test
pnpm run test               # unit tests
pnpm run test:e2e           # end-to-end tests
pnpm run test:cov           # coverage report

# Lint
pnpm run lint
pnpm run lint:fix
```

---

## 🧩 Key Features

### LLM Provider Abstraction

Swap LLM providers by changing one environment variable — zero code change.

```typescript
// Switch provider via .env only
LLM_PROVIDER=ollama   # local dev
LLM_PROVIDER=groq     # POC / staging
LLM_PROVIDER=claude   # production
```

All providers implement `ILLMProvider` interface:
- `generateQuiz(prompt: QuizPrompt): Promise<QuizResponse>`
- `suggestCategory(text: string): Promise<string>`

Built-in retry logic (3 attempts) and JSON validation in `LlmService`.

### Repository Pattern

Domain defines the contract. Infrastructure implements it.

```typescript
// domain/interfaces/repositories/save.repository.interface.ts
export interface ISaveRepository {
  create(save: SaveEntity): Promise<SaveEntity>;
  findByUserId(userId: string): Promise<SaveEntity[]>;
  countByUserAndMonth(userId: string, year: number, month: number): Promise<number>;
}

// infrastructure/repositories/save.repository.ts
@Injectable()
export class SaveRepository implements ISaveRepository { ... }

// Injection via token
{ provide: 'SAVE_REPOSITORY', useClass: SaveRepository }
```

### Domain Services

Business rules live in `domain/services/`:

| Service | Rule |
|---|---|
| `save-limit.domain.service.ts` | Free tier: 20 saves/month per user |
| `difficulty.domain.service.ts` | Level adaptation: nudge up after 5 days 90%+, nudge down after 50%- |
| `llm/quiz-prompt.builder.ts` | Build LLM prompt from SaveEntity + user level |

---

## 🗄️ Database Schema

```sql
-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  level       VARCHAR(5) DEFAULT 'B1',   -- A2 | B1 | B2 | C1
  tier        VARCHAR(20) DEFAULT 'free', -- free | pro | lifetime
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Saved highlights
CREATE TABLE saves (
  id           UUID PRIMARY KEY,
  user_id      UUID REFERENCES users(id),
  text         TEXT NOT NULL,
  sentence     TEXT,
  paragraph    TEXT,
  source_url   TEXT,
  category     VARCHAR(50),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- Quiz attempts
CREATE TABLE quizzes (
  id            UUID PRIMARY KEY,
  user_id       UUID REFERENCES users(id),
  save_id       UUID REFERENCES saves(id),
  question      TEXT NOT NULL,
  options       JSONB NOT NULL,
  correct       VARCHAR(5) NOT NULL,
  user_answer   VARCHAR(5),
  is_correct    BOOLEAN,
  created_at    TIMESTAMP DEFAULT NOW()
);
```

---

## 🔑 API Endpoints

```
Auth
POST   /auth/google              → Google OAuth callback
POST   /auth/refresh             → Refresh JWT token

Saves
POST   /saves                    → Create new save
GET    /saves                    → List user's saves
DELETE /saves/:id                → Delete a save
POST   /saves/suggest-category   → LLM auto-suggest category

Quiz
POST   /quiz/generate/:saveId    → Generate MCQ for a save
POST   /quiz/:quizId/answer      → Submit answer
GET    /quiz/history             → Quiz history

Users
GET    /users/me                 → Current user profile
PATCH  /users/me                 → Update level, goal

Payments
POST   /payments/checkout        → Stripe checkout session
POST   /payments/webhook         → Stripe webhook handler
```

---

## 💰 Monetization

| Tier | Price | Limits |
|---|---|---|
| **Free** | $0 | 20 saves/month |
| **Pro** | $4.99/month | Unlimited saves + Daily Digest + Chatbot (V2) |
| **Lifetime** | $49 one-time | Same as Pro, forever |

---

## 🛠️ Tech Stack

| Component | Technology | Hosting |
|---|---|---|
| API | NestJS + TypeScript | Railway / Render |
| Website | Next.js | Vercel |
| Database | PostgreSQL | Supabase |
| Cache | Redis | Upstash |
| LLM (dev) | Ollama | Local |
| LLM (POC) | Groq | Free tier |
| LLM (prod) | Claude API | Pay per use |
| Payments | Stripe | — |
| Extension | Vanilla JS (Manifest V3) | Chrome Web Store |

**Total POC cost:** $0/month

---

## 📚 Documentation

- **[AGENTS.md](./AGENTS.md)** — Development guide, architecture rules, commands
- **[architect.md](./architect.md)** — Technical architecture, system design, build sequence
- **[prd.md](./prd.md)** — Product requirements, user stories, roadmap

---

## 🎯 Target Users

**Primary (V1):** English learners in Southeast Asia (B1–C1 level)
- Students preparing for IELTS / TOEFL
- Professionals reading English content daily
- Self-learners wanting to learn from real content, not generic lessons

---

## 🚢 Roadmap

### V1 — MVP (6 weeks)
- ✅ Chrome extension with highlight capture
- ✅ AI-powered category suggestion
- ✅ On-demand quiz generation
- ✅ Google OAuth + Stripe integration
- ✅ Free tier enforcement (20 saves/month)

### V2 — Post-PMF
- Daily Digest: end-of-day summary card
- Chatbot: scoped to user's saved knowledge base (paid only)
- Additional quiz types: Flashcard, Fill-in-the-blank
- Difficulty auto-adaptation

### V3 — Growth
- Multi-language support (Spanish, Japanese, Korean)
- Spaced repetition scheduling
- Teacher/classroom mode
- Mobile app

---

## 🤝 Contributing

This is a solo founder project. Contributions are welcome after V1 launch.

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

Architecture inspired by [nestjs-clean-architecture](https://github.com/CollatzConjecture/nestjs-clean-architecture)
