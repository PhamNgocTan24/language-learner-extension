'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateUser } from '@/app/actions/users';
import Button from '@/components/ui/Button';

const LEVELS = [
  { value: 'A2', label: 'A2 — Beginner', desc: 'I know basics but struggle with complex texts' },
  { value: 'B1', label: 'B1 — Intermediate', desc: 'I can read general articles with some effort' },
  { value: 'B2', label: 'B2 — Upper-intermediate', desc: 'I read most things but want to refine vocabulary' },
  { value: 'C1', label: 'C1 — Advanced', desc: 'I read fluently and want to master nuances' },
];

const GOALS = [
  { value: 'read_news', label: '📰 Read the news', desc: 'Stay on top of current events in English' },
  { value: 'work', label: '💼 Work in English', desc: 'Emails, meetings, and professional writing' },
  { value: 'ielts', label: '🎓 IELTS / TOEFL', desc: 'Prepare for an English proficiency exam' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState('B1');
  const [goal, setGoal] = useState('read_news');
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    try {
      await updateUser({ level, goal });
    } finally {
      router.replace('/dashboard');
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-12">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                n <= step ? 'bg-brand-primary' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-4xl mb-4">👋</div>
            <h1 className="text-2xl font-semibold mb-2">Welcome to LearnClip</h1>
            <p className="text-sm text-gray-500 mb-8">
              Let&apos;s personalise your experience. Takes 30 seconds.
            </p>
            <Button fullWidth onClick={() => setStep(2)}>Let&apos;s go →</Button>
          </div>
        )}

        {/* Step 2 — Level */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-semibold mb-1">What&apos;s your English level?</h2>
            <p className="text-sm text-gray-500 mb-6">We&apos;ll adapt quiz difficulty to match.</p>
            <div className="flex flex-col gap-3 mb-8">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`text-left border-2 rounded-xl p-4 transition-colors ${
                    level === l.value
                      ? 'border-brand-primary bg-brand-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{l.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{l.desc}</div>
                </button>
              ))}
            </div>
            <Button fullWidth onClick={() => setStep(3)}>Next →</Button>
          </div>
        )}

        {/* Step 3 — Goal */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-semibold mb-1">What&apos;s your goal?</h2>
            <p className="text-sm text-gray-500 mb-6">We&apos;ll tailor vocabulary suggestions.</p>
            <div className="flex flex-col gap-3 mb-8">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`text-left border-2 rounded-xl p-4 transition-colors ${
                    goal === g.value
                      ? 'border-brand-primary bg-brand-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium">{g.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
            <Button fullWidth disabled={saving} onClick={finish}>
              {saving ? 'Saving...' : 'Start learning 🚀'}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
