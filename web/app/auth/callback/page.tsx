'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * /auth/callback
 * NestJS redirects here after Google OAuth with tokens in query params.
 * Stores tokens as cookies (readable by server actions) then redirects.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    async function run() {
      const accessToken = params.get('accessToken');
      const refreshToken = params.get('refreshToken');

      if (!accessToken || !refreshToken) {
        router.replace('/?error=auth_failed');
        return;
      }

      // Store tokens in cookies so Server Actions can read them
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      document.cookie = `accessToken=${accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${maxAge}; SameSite=Lax`;

      // Forward tokens to Chrome extension if installed, then redirect
      const extensionId = process.env.NEXT_PUBLIC_EXTENSION_ID;
      const chromeRuntime = (window as { chrome?: { runtime?: { sendMessage?: (...args: unknown[]) => void; lastError?: unknown } } })?.chrome?.runtime;
      if (typeof window !== 'undefined' && extensionId && chromeRuntime?.sendMessage) {
        try {
          await new Promise<void>((resolve) => {
            chromeRuntime.sendMessage!(
              extensionId,
              { type: 'AUTH_TOKENS', accessToken, refreshToken },
              () => {
                void chromeRuntime.lastError;
                resolve();
              },
            );
            setTimeout(resolve, 1000);
          });
        } catch {
          // Extension not installed — fine
        }
      }

      router.replace('/dashboard');
    }

    run();
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">📌</div>
        <p className="text-sm text-gray-500">Signing you in...</p>
      </div>
    </div>
  );
}
