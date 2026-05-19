'use server';

import { cookies } from 'next/headers';
import type { User, UserStats } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value ?? null;
}

export async function getMe(): Promise<User | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getStats(): Promise<UserStats | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/users/me/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateUser(data: { level?: string; goal?: string }): Promise<User | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
