<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

# AGENTS.md — apps/web (Next.js)

Next.js 16 frontend for LearnClip. App Router. Tailwind CSS. TypeScript strict.
All API calls go to apps/api. No business logic here — UI only.

---

## Commands

```bash
pnpm run dev          # start dev server
pnpm run build        # production build
pnpm run lint         # ESLint
pnpm run lint:fix
pnpm run type-check   # tsc --noEmit
```

---

## Design tokens

### Colors

| Token | Hex | Usage |
|---|---|---|
| `brand-primary` | `#185FA5` | Buttons, links, active states |
| `brand-primary-hover` | `#0C447C` | Hover on primary elements |
| `brand-primary-light` | `#E6F1FB` | Backgrounds, badges |
| `accent` | `#EF9F27` | CTA buttons, save action, highlights |
| `accent-hover` | `#BA7517` | Hover on CTA |
| `accent-light` | `#FAEEDA` | Accent backgrounds |
| `success` | `#1D9E75` | Correct answer, saved confirmation |
| `success-light` | `#E1F5EE` | Success backgrounds |
| `error` | `#E24B4A` | Wrong answer, free tier limit |
| `error-light` | `#FCEBEB` | Error backgrounds |

**This project uses Tailwind v4.** There is no `tailwind.config.ts`. All tokens are defined in `app/globals.css` using the `@theme` block:

```css
/* app/globals.css */
@import "tailwindcss";
@source "../components/**/*.{ts,tsx}";
@source "../app/**/*.{ts,tsx}";

@theme {
  --color-brand-primary: #185FA5;
  --color-brand-primary-hover: #0C447C;
  --color-brand-primary-light: #E6F1FB;

  --color-accent: #EF9F27;
  --color-accent-hover: #BA7517;
  --color-accent-light: #FAEEDA;

  --color-success: #1D9E75;
  --color-success-light: #E1F5EE;

  --color-error: #E24B4A;
  --color-error-light: #FCEBEB;
}
```

Do **not** create `tailwind.config.ts` — Tailwind v4 ignores it when using `@import "tailwindcss"`.
The `@source` directives are required so v4 scans the right files for class names.

### Typography

| Role | Class | Size | Weight |
|---|---|---|---|
| Page heading | `text-2xl font-semibold` | 24px | 600 |
| Section heading | `text-lg font-medium` | 18px | 500 |
| Body | `text-base` | 16px | 400 |
| Caption / label | `text-sm text-gray-500` | 14px | 400 |
| Micro / badge | `text-xs` | 12px | 400–500 |

Font: Inter. Already in `layout.tsx` via `next/font/google`.

### Spacing

Use Tailwind spacing scale. Common patterns:
- Page padding: `px-4 md:px-8`
- Card padding: `p-4 md:p-5`
- Section gap: `gap-6`
- Inline gap: `gap-2` or `gap-3`

### Border radius

| Element | Class |
|---|---|
| Button, input, badge | `rounded-md` (8px) |
| Card, modal | `rounded-xl` (12px) |
| Pill / tag | `rounded-full` |

### Shadows

No decorative shadows. One exception: cards use `shadow-sm` — nothing heavier.

---

## Component rules

**File location:**
```
app/
├── (auth)/              → login, onboarding pages
├── dashboard/           → saved items list
├── quiz/[saveId]/       → quiz interface
└── settings/            → profile, subscription

components/
├── ui/                  → generic: Button, Input, Badge, Card, Modal
├── quiz/                → QuizCard, AnswerOption, ExplanationPanel
├── saves/               → SaveItem, CategoryBadge, SavesList
└── layout/              → Navbar, Sidebar, PageWrapper
```

**Component rules:**
- Functional components only — no class components
- Props typed with `interface`, not `type` (consistent with API layer)
- Server components by default. Add `'use client'` only when needed (event handlers, useState, browser APIs)
- Never fetch data in client components — use Server Components + Server Actions
- Loading states: use `loading.tsx` per route segment, not inline spinners ad-hoc

---

## UI patterns

### Buttons

```tsx
// Primary action (save, submit)
<button className="bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
  Save
</button>

// CTA / accent (quiz me, upgrade)
<button className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
  Quiz me
</button>

// Ghost
<button className="border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-md text-sm transition-colors">
  Cancel
</button>
```

### Category badges

```tsx
const categoryColors = {
  Vocabulary:   'bg-brand-primary-light text-brand-primary',
  Phrase:       'bg-accent-light text-accent-hover',
  Grammar:      'bg-purple-50 text-purple-700',
  Idiom:        'bg-teal-50 text-teal-700',
  Pronunciation:'bg-gray-100 text-gray-600',
}

<span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[category]}`}>
  {category}
</span>
```

### Quiz answer states

```tsx
// Unanswered
'border border-gray-200 hover:border-brand-primary hover:bg-brand-primary-light'

// Correct
'border border-success bg-success-light text-success font-medium'

// Wrong (selected)
'border border-error bg-error-light text-error'

// Correct (not selected — reveal after wrong pick)
'border border-success bg-success-light'
```

---

## API calls

All server-side. Use Server Actions or Route Handlers — never `fetch()` directly in client components.

```ts
// app/actions/saves.ts
'use server';

import { cookies } from 'next/headers';
import type { Save } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value ?? null;
}

export async function getSaves(page = 1, limit = 20): Promise<Save[]> {
  const token = await getToken();
  if (!token) return [];

  const res = await fetch(`${API_BASE}/saves?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) return [];
  return res.json();
}

export async function deleteSave(id: string): Promise<void> {
  const token = await getToken();
  if (!token) return;

  await fetch(`${API_BASE}/saves/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function suggestCategory(text: string): Promise<string> {
  const token = await getToken();
  if (!token) return 'Vocabulary';

  const res = await fetch(`${API_BASE}/saves/suggest-category`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) return 'Vocabulary';
  const data = await res.json();
  return data.category ?? 'Vocabulary';
}
```

---

## Free tier UX

When user hits 20 saves/month limit:
- Show inline banner on dashboard: amber background (`bg-accent-light`), not a blocking modal
- "Upgrade to Pro" button in accent color
- Do not block access to existing saves or quiz history

---

## What NOT to do

- Do not use `<img>` — use `next/image` always
- Do not hardcode API URLs — use `process.env.NEXT_PUBLIC_API_URL`
- Do not put logic in page components — extract to hooks or server actions
- Do not use inline styles — Tailwind classes only
- Do not add animations heavier than `transition-colors` or `transition-opacity` — keep it fast and focused
- Do not use red color for anything except wrong answers and errors — it has strong meaning here
- Do not create `tailwind.config.ts` — this project uses Tailwind v4, tokens go in `@theme {}` in `globals.css`
- Do not add external image hostnames in `next/image` src without adding them to `images.remotePatterns` in `next.config.ts`
<!-- END:nextjs-agent-rules -->
