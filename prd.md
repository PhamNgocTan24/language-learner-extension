# Product Requirements Document (PRD)
## LearnClip — Turn Your Reading Into English Mastery

**Version:** 1.0  
**Status:** Draft  
**Author:** Solo Founder  
**Last Updated:** May 2026

---

## 1. Product Overview

LearnClip is a Chrome extension paired with a web application that transforms passive English reading into active learning. When a user highlights text on any webpage, LearnClip captures it with full context and uses AI to generate exercises — turning every article, paper, or blog post into a personalized learning session.

---

## 2. Problem Statements

| # | Pain Point |
|---|---|
| 1 | English learners encounter new vocabulary and phrases while browsing but have no frictionless way to save and review them |
| 2 | Saved words without context are useless — learners forget why they saved them and how they were used |
| 3 | There is no tool that connects what a user reads to active practice exercises automatically |

---

## 3. Target Users

**Primary (V1):** English learners in Southeast Asia, specifically Vietnam
- Students preparing for IELTS / TOEFL
- Professionals wanting to read English content confidently
- Self-learners at B1–C1 level browsing English articles daily

**Secondary (V2+):** Learners of other languages (Spanish, Japanese, Korean)

### User Persona
> **Minh, 26, Marketing Executive, Ho Chi Minh City**
> Reads English marketing blogs daily but struggles to retain vocabulary. Uses Duolingo but feels exercises are disconnected from what he actually reads. Wants to learn from his own real content, not generic lessons.

---

## 4. Goals & Success Metrics

| Goal | Metric | V1 Target |
|---|---|---|
| Adoption | Weekly Active Users | 100 WAU within 3 months |
| Engagement | Avg. quizzes completed per user per week | ≥ 5 |
| Retention | Day-30 retention rate | ≥ 25% |
| Revenue | Paid conversions | 20 paying users within 3 months |
| Quality | Quiz completion rate (not abandoned) | ≥ 70% |

---

## 5. Feature Scope

### V1 — MVP (Ship in 6 weeks)

#### 5.1 Chrome Extension — Capture Layer

- User highlights text on any webpage
- Extension shows a save button on selection
- On save, extension captures:
  - Selected text (word, phrase, or sentence)
  - Full surrounding sentence
  - Parent paragraph (context)
  - Page title + URL (source metadata)
- LLM auto-suggests a category — user confirms or changes
- Silent save — no redirect, no interruption to reading flow
- Tiny success toast notification after save

**Categories (5 fixed):**
`Vocabulary` | `Phrase` | `Grammar` | `Idiom` | `Pronunciation`

#### 5.2 Website — Quiz Interface

- Saved items list (filterable by category, date)
- Quiz generator: user clicks "Quiz me" → LLM generates MCQ on demand
- MCQ format: 1 question, 4 options, 1 correct answer + explanation
- Quiz result stored (correct / incorrect)
- Basic onboarding: 5-question mini quiz to infer user level silently

#### 5.3 Onboarding

- Step 1: User picks goal (Read news / Work in English / Pass IELTS)
- Step 2: 5-question fill-in-the-blank mini quiz (level inference, feels like product demo)
- Step 3: Confirm inferred level — user can adjust manually anytime

#### 5.4 Auth & Payments

- Google OAuth login
- Stripe integration
- Free tier enforcement (save counter via Redis)
- Upgrade flow on limit hit

---

### V2 — Post-PMF

- Daily Digest: end-of-day summary card ("You saved 8 items today — here are the top 3")
- Chatbot: ask questions scoped to user's saved knowledge base only (**paid only**)
- Additional quiz types: Flashcard, Fill-in-the-blank
- Difficulty auto-adaptation based on quiz performance history

### V3 — Growth

- Multi-language support (Spanish, Japanese, Korean)
- Spaced repetition scheduling (Anki-style)
- Teacher/classroom mode
- Mobile app

---

## 6. User Stories

### Extension
- As a user, I can highlight any text on a webpage and save it with one click
- As a user, I see the suggested category and can confirm or change it before saving
- As a user, my reading flow is not interrupted when I save

### Quiz
- As a user, I can view all my saved items on the website
- As a user, I can start a quiz session and receive an MCQ based on what I saved
- As a user, I can see the correct answer and explanation after answering
- As a user, my quiz history is tracked so I can see my progress

### Onboarding
- As a new user, I complete a short onboarding that sets my English level
- As a user, I can manually adjust my level at any time in settings

### Payments
- As a free user, I can save up to 20 items per month
- As a free user, I see an upgrade prompt when I hit my limit
- As a paid user, I have unlimited saves and quiz generation
- As a paid user, I have access to the chatbot (V2)

---

## 7. UX Principles

1. **Zero interruption on save** — extension never redirects mid-reading
2. **Context is everything** — every saved item carries its sentence, paragraph, and source
3. **LLM does the work** — user should never manually write a quiz or categorize from scratch
4. **Fail gracefully** — if LLM fails, show a friendly error, never crash silently
5. **Mobile-friendly website** — users may open website on phone during commute

---

## 8. Monetization

| Tier | Price | Limits | Features |
|---|---|---|---|
| Free | $0 | 20 saves/month | Save + MCQ quiz |
| Pro | $4.99/month | Unlimited | Save + MCQ + Daily Digest + Chatbot (V2) |
| Lifetime | $49 one-time | Unlimited | Same as Pro, forever |

**Paywall logic:**
- Chatbot is paid only — it's the strongest retention feature
- Limit saves (input), not exercises (output) — user feels value before hitting wall
- Lifetime deal targets SEA price sensitivity and converts early evangelists

---

## 9. Difficulty Adaptation

- User level set during onboarding (A2 / B1 / B2 / C1)
- LLM receives user level in every quiz generation prompt
- System tracks performance: if user scores 90%+ for 5 consecutive days → suggest level up
- If user scores below 50% for 5 consecutive days → gentle nudge to review or slow down
- User always makes the final decision — system only surfaces the signal

**Content vs Performance conflict rule:**
> Advanced saved content always wins. If a B1 user saves from an academic paper, generate B2-level exercises. Respect the user's goal, not just their current comfort zone.

---

## 10. Go-To-Market (V1)

**Phase 1 — First 100 users (Month 1-2)**
- Post in Vietnamese English learning Facebook groups manually
- Reddit: r/LearnEnglish, r/languagelearning, r/sideprojects
- Personal network outreach

**Phase 2 — Teacher partnerships (Month 2-3)**
- Identify 10 IELTS tutors / English teachers in Vietnam
- Offer free lifetime Pro accounts
- Referral code: their students get 1 month free
- Target: 10 teachers × 30 students = 300 users

**Phase 3 — Content (Month 3+)**
- One 60-second demo video: full loop from highlight → save → quiz
- Post on TikTok / YouTube Shorts
- Dev story post on Dev.to or Medium

---

## 11. Out of Scope (V1)

- Mobile app
- Offline mode
- Multi-language support
- Spaced repetition
- Social / sharing features
- Browser support beyond Chrome
- General English tutoring (chatbot is scoped to saved content only)
