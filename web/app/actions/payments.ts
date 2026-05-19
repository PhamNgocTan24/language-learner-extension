'use server';

import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value ?? null;
}

export async function createCheckout(priceId: string): Promise<{ url: string } | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ priceId }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getPortalUrl(): Promise<{ url: string } | null> {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/payments/portal`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
