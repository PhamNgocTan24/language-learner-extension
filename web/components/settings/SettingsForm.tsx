'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle, LogOut, Zap } from 'lucide-react';
import { updateUser } from '@/app/actions/users';
import { createCheckout, getPortalUrl } from '@/app/actions/payments';
import AccentButton from '@/components/ui/AccentButton';
import PrimaryButton from '@/components/ui/PrimaryButton';
import type { User } from '@/lib/types';

const LEVELS: Array<User['level']> = ['A2', 'B1', 'B2', 'C1'];

const GOALS = [
  { id: 'read_news', emoji: '📰', title: 'Read the news' },
  { id: 'work', emoji: '💼', title: 'Work in English' },
  { id: 'ielts', emoji: '🎓', title: 'IELTS / TOEFL' },
  { id: 'casual', emoji: '💬', title: 'Casual conversation' },
];

const LANGUAGES = [
  { code: 'VN', name: 'Tiếng Việt' },
  { code: 'CN', name: '中文' },
  { code: 'JP', name: '日本語' },
  { code: 'KR', name: '한국어' },
  { code: 'ES', name: 'Español' },
  { code: 'FR', name: 'Français' },
  { code: 'BR', name: 'Português' },
  { code: 'TH', name: 'ภาษาไทย' },
  { code: 'ID', name: 'Bahasa Indonesia' },
  { code: 'SA', name: 'العربية' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'IN', name: 'हिन्दी' },
];

interface SettingsFormProps {
  user: User;
}

function getInitials(user: User): string {
  const source = user.name ?? user.email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter();
  const [level, setLevel] = useState<User['level']>(user.level);
  const [goal, setGoal] = useState(user.goal ?? 'read_news');
  const [nativeLanguage, setNativeLanguage] = useState(user.nativeLanguage ?? 'Tiếng Việt');
  const [showLanguages, setShowLanguages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const language =
    LANGUAGES.find((item) => item.name === nativeLanguage) ??
    LANGUAGES.find((item) => item.name === 'Tiếng Việt') ??
    LANGUAGES[0];

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await updateUser({ level, goal, nativeLanguage });
    setSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  async function handleUpgrade() {
    if (user.tier !== 'free') {
      const result = await getPortalUrl();
      if (result?.url) window.location.href = result.url;
      return;
    }

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? '';
    const result = await createCheckout(priceId);
    if (result?.url) window.location.href = result.url;
  }

  function handleLogout() {
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';
    router.replace('/');
  }

  return (
    <div className="fade-in">
      <section className="mb-4 rounded-xl border border-gray-100 bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Account
        </p>

        <div className="mb-4 flex items-center gap-3">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name ?? 'Profile picture'}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
              {getInitials(user)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {user.name ?? 'LearnClip User'}
            </p>
            <p className="truncate text-xs text-gray-400">{user.email}</p>
          </div>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
            {user.tier === 'free' ? 'Free' : 'Pro'}
          </span>
        </div>

        <AccentButton
          fullWidth={false}
          size="sm"
          className="mx-auto w-full max-w-sm"
          onClick={handleUpgrade}
        >
          <Zap size={15} />
          {user.tier === 'free' ? 'Upgrade to Pro - Unlimited saves' : 'Manage billing'}
        </AccentButton>
        <p className="mt-2 text-center text-xs text-gray-400">
          Free plan: 20 saves/month · Pro: unlimited + priority quiz generation
        </p>
      </section>

      <section className="mb-4 rounded-xl border border-gray-100 bg-white p-5">
        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Learning preferences
        </p>

        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          English Level
        </p>
        <div className="mb-5 flex gap-2">
          {LEVELS.map((item) => (
            <button
              key={item}
              onClick={() => setLevel(item)}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                level === item
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Learning Goal
        </p>
        <div className="mb-5 space-y-2">
          {GOALS.map((item) => (
            <button
              key={item.id}
              onClick={() => setGoal(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors ${
                goal === item.id
                  ? 'border-brand-primary bg-brand-primary-light'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <span>{item.emoji}</span>
              <span className="text-sm font-medium text-gray-900">{item.title}</span>
              {goal === item.id && <CheckCircle size={16} className="ml-auto text-brand-primary" />}
            </button>
          ))}
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Show Meanings In
        </p>
        <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3.5">
          <span className="text-sm font-medium text-gray-900">
            <span className="mr-2 text-xs text-gray-400">{language.code}</span>
            {language.name}
          </span>
          <button
            onClick={() => setShowLanguages((current) => !current)}
            className="text-xs text-gray-500 transition-colors hover:text-brand-primary"
          >
            Change
          </button>
        </div>

        {showLanguages && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                onClick={() => {
                  setNativeLanguage(item.name);
                  setShowLanguages(false);
                }}
                className={`rounded-md border px-2 py-2 text-sm transition-colors ${
                  nativeLanguage === item.name
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-gray-100 text-gray-600 hover:border-gray-200'
                }`}
              >
                <span className="mr-1 text-xs text-gray-400">{item.code}</span>
                {item.name}
              </button>
            ))}
          </div>
        )}

        <PrimaryButton className="mt-5" disabled={saving} onClick={handleSave}>
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save preferences'}
        </PrimaryButton>
      </section>

      <section className="rounded-xl border border-gray-100 bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
          Session
        </p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          <LogOut size={15} /> Log out
        </button>
      </section>
    </div>
  );
}
