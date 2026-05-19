'use server';

import { cookies } from 'next/headers';
import type { Quiz } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value ?? null;
}

export async function generateQuiz(saveId: string): Promise<Quiz | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/quiz/generate/${saveId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function submitAnswer(quizId: string, answer: string): Promise<Quiz | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/quiz/${quizId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answer }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getQuizHistory(): Promise<Quiz[]> {
  const token = await getToken();
  if (!token) return [];

  try {
    const res = await fetch(`${API_BASE}/quiz/history`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
