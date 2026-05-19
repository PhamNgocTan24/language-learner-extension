/**
 * Thin API client — all calls to the NestJS backend go through here.
 * Reads/writes tokens from localStorage.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

// ── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('tokenExpiry', String(Date.now() + 14 * 60 * 1000));
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
}

export function isLoggedIn(): boolean {
  const token = getAccessToken();
  const expiry = localStorage.getItem('tokenExpiry');
  return !!(token && expiry && Date.now() < Number(expiry));
}

// ── Base fetcher ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(error.message ?? 'API error'), { status: res.status, data: error });
  }

  return res.json();
}

// ── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  me: () => apiFetch<User>('/users/me'),
  stats: () => apiFetch<UserStats>('/users/me/stats'),
  update: (data: { level?: string; goal?: string }) =>
    apiFetch<User>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
};

// ── Saves ────────────────────────────────────────────────────────────────────

export const savesApi = {
  list: (page = 1, limit = 20) =>
    apiFetch<Save[]>(`/saves?page=${page}&limit=${limit}`),
  create: (data: CreateSavePayload) =>
    apiFetch<Save>('/saves', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) =>
    apiFetch<void>(`/saves/${id}`, { method: 'DELETE' }),
  suggestCategory: (text: string) =>
    apiFetch<{ category: string }>('/saves/suggest-category', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
};

// ── Quiz ─────────────────────────────────────────────────────────────────────

export const quizApi = {
  generate: (saveId: string) =>
    apiFetch<Quiz>(`/quiz/generate/${saveId}`, { method: 'POST' }),
  answer: (quizId: string, answer: string) =>
    apiFetch<Quiz>(`/quiz/${quizId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),
  history: () => apiFetch<Quiz[]>('/quiz/history'),
};

// ── Payments ──────────────────────────────────────────────────────────────────

export const paymentsApi = {
  checkout: (priceId: string) =>
    apiFetch<{ url: string }>('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    }),
  portal: () => apiFetch<{ url: string }>('/payments/portal'),
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  level: 'A2' | 'B1' | 'B2' | 'C1';
  goal: string | null;
  tier: 'free' | 'pro' | 'lifetime';
  createdAt: string;
}

export interface UserStats {
  total: number;
  correct: number;
  accuracy: number;
}

export interface Save {
  id: string;
  text: string;
  sentence: string | null;
  sourceUrl: string | null;
  sourceTitle: string | null;
  category: string | null;
  createdAt: string;
}

export interface CreateSavePayload {
  text: string;
  sentence?: string;
  paragraph?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  category?: string;
}

export interface Quiz {
  id: string;
  saveId: string;
  question: string;
  options: string[];
  correct?: string;
  explanation?: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  createdAt: string;
}
