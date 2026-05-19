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

  try {
    const res = await fetch(`${API_BASE}/saves?page=${page}&limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function deleteSave(id: string): Promise<void> {
  const token = await getToken();
  if (!token) return;

  try {
    await fetch(`${API_BASE}/saves/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // silently fail — caller can revalidate
  }
}

export async function suggestCategory(text: string): Promise<string> {
  const token = await getToken();
  if (!token) return 'Vocabulary';

  try {
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
  } catch {
    return 'Vocabulary';
  }
}
