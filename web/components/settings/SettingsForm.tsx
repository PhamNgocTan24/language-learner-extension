'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateUser } from '@/app/actions/users';
import { createCheckout, getPortalUrl } from '@/app/actions/payments';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { User } from '@/lib/types';

const LEVELS = ['A2', 'B1', 'B2', 'C1'];
const GOALS = [
  { value: 'read_news', label: '📰 Read the news' },
  { value: 'work',      label: '💼 Work in English' },
  { value: 'ielts',     label: '🎓 IELTS / TOEFL' },
];

interface SettingsFormProps {
  user: User;
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const [level, setLevel] = useState(user.level);
  const [goal, setGoal]   = useState(user.goal ?? 'read_news');
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await updateUser({ level, goal });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleUpgrade() {
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? '';
    const result = await createCheckout(priceId);
    if (result?.url) window.location.href = result.url;
  }

  async function handlePortal() {
    const result = await getPortalUrl();
    if (result?.url) window.location.href = result.url;
  }

  function handleLogout() {
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';
    router.replace('/');
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Account */}
      <Card>
        <h2 className="text-lg font-medium mb-4">Account</h2>
        <div className="flex items-center gap-3 mb-4">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name ?? 'Avatar'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand-primary-light flex items-center justify-center text-brand-primary font-semibold text-sm">
              {(user.name ?? user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
            user.tier === 'free'
              ? 'bg-gray-100 text-gray-600'
              : 'bg-brand-primary-light text-brand-primary'
          }`}>
            {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
          </span>
        </div>

        {user.tier === 'free' ? (
          <Button variant="accent" fullWidth onClick={handleUpgrade}>
            Upgrade to Pro — Unlimited saves
          </Button>
        ) : (
          <Button variant="ghost" fullWidth onClick={handlePortal}>
            Manage billing
          </Button>
        )}
      </Card>

      {/* Learning preferences */}
      <Card>
        <h2 className="text-lg font-medium mb-4">Learning preferences</h2>

        <label className="block text-sm text-gray-500 mb-2">English level</label>
        <div className="flex gap-2 mb-5">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l as User['level'])}
              className={`flex-1 py-2 text-sm font-medium rounded-md border-2 transition-colors ${
                level === l
                  ? 'border-brand-primary bg-brand-primary-light text-brand-primary'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <label className="block text-sm text-gray-500 mb-2">Goal</label>
        <div className="flex flex-col gap-2 mb-6">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={`text-left py-2.5 px-4 text-sm rounded-md border-2 transition-colors ${
                goal === g.value
                  ? 'border-brand-primary bg-brand-primary-light text-brand-primary font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <Button fullWidth disabled={saving} onClick={handleSave}>
          {saved ? '✅ Saved!' : saving ? 'Saving...' : 'Save preferences'}
        </Button>
      </Card>

      {/* Session */}
      <Card>
        <h2 className="text-lg font-medium mb-4">Session</h2>
        <Button variant="danger" fullWidth onClick={handleLogout}>
          Log out
        </Button>
      </Card>
    </div>
  );
}
