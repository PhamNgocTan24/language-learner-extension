'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { updateUser } from '@/app/actions/users';

const STEP_LABELS: Record<number, string> = {
  1: 'Learning Goal',
  2: 'Native Language',
  3: 'Level Check',
  4: 'Level Check',
  5: 'Level Check',
  6: 'Level Check',
};

const GOALS = [
  {
    id: 'read_news',
    emoji: '📰',
    title: 'Read the news',
    subtitle: 'Stay informed on global topics',
  },
  {
    id: 'work',
    emoji: '💼',
    title: 'Work in English',
    subtitle: 'Emails, meetings, presentations',
  },
  {
    id: 'ielts',
    emoji: '🎓',
    title: 'IELTS / TOEFL',
    subtitle: 'Pass a certification exam',
  },
  {
    id: 'casual',
    emoji: '💬',
    title: 'Casual conversation',
    subtitle: 'Chat with native speakers',
  },
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

const QUESTIONS = [
  {
    category: 'Vocabulary',
    level: 'B2',
    text: "In the sentence, 'The editor was meticulous about every comma,' what does meticulous mean?",
    options: ['Careless', 'Very careful and detailed', 'Fast', 'Confused'],
    correct: 1,
  },
  {
    category: 'Grammar',
    level: 'B1',
    text: 'Which sentence uses the present perfect correctly?',
    options: [
      'I have lived here for three years.',
      'I live here since three years.',
      'I am live here for three years.',
      'I was lived here since three years.',
    ],
    correct: 0,
  },
  {
    category: 'Phrase',
    level: 'C1',
    text: "What does 'take it with a grain of salt' mean?",
    options: [
      'Eat something carefully',
      'Accept it immediately',
      'Do not fully trust it',
      'Make it more interesting',
    ],
    correct: 2,
  },
  {
    category: 'Vocabulary',
    level: 'B2',
    text: 'Which word has a different vowel sound?',
    options: ['seat', 'need', 'green', 'bread'],
    correct: 3,
  },
];

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const progressClasses: Record<number, string> = {
  2: 'w-1/5',
  3: 'w-2/5',
  4: 'w-3/5',
  5: 'w-4/5',
  6: 'w-full',
};

function ContinueButton({
  disabled,
  children,
  onClick,
}: {
  disabled: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  if (disabled) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-full bg-[#C7D2FE] px-6 py-3 font-semibold text-white"
      >
        {children}
      </button>
    );
  }

  return (
    <PrimaryButton onClick={onClick}>
      {children}
    </PrimaryButton>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);

  const score = useMemo(
    () =>
      QUESTIONS.reduce((total, question, index) => {
        return total + (answers[index] === question.correct ? 1 : 0);
      }, 0),
    [answers],
  );

  const level = score <= 1 ? 'A2' : score === 2 ? 'B1' : score === 3 ? 'B2' : 'C1';
  const levelName = {
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper-intermediate',
    C1: 'Advanced',
  }[level];

  const selectedGoal = GOALS.find((item) => item.id === goal);
  const selectedLanguage = LANGUAGES.find((item) => item.name === language);

  function continueFromQuestion(questionIndex: number) {
    if (step === 6) {
      setStep(7);
      return;
    }

    if (answers[questionIndex] !== undefined) {
      setStep((current) => current + 1);
    }
  }

  async function finish() {
    if (!goal || !language) return;

    setSaving(true);
    try {
      await updateUser({ level, goal, nativeLanguage: language });
    } finally {
      router.replace('/dashboard');
    }
  }

  return (
    <main className="min-h-screen bg-surface-page text-gray-900">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
        <Logo />
        <span className="text-sm text-gray-400">
          {step <= 6 ? `Step ${step} of 6` : 'Complete'}
        </span>
      </div>

      {step > 1 && step <= 6 && (
        <div className="h-1 bg-gray-100">
          <div
            className={`${progressClasses[step]} h-1 bg-brand-primary transition-all duration-500`}
          />
        </div>
      )}

      <div className="mx-auto w-full max-w-lg px-4 pb-12 pt-16">
        {step <= 6 && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-primary">
            STEP {step} - {STEP_LABELS[step]}
          </p>
        )}

        {step === 1 && (
          <section className="fade-in">
            <h1 className="text-2xl font-bold">What are you learning English for?</h1>
            <p className="mt-2 text-sm text-gray-500">
              LearnClip will tune examples and quizzes around your main goal.
            </p>
            <div className="mt-8 space-y-3">
              {GOALS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setGoal(option.id)}
                  className={`flex w-full cursor-pointer items-center rounded-xl bg-white p-4 text-left transition-colors ${
                    goal === option.id
                      ? 'border-2 border-brand-primary bg-brand-primary-light'
                      : 'border border-gray-200 hover:border-brand-primary'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="ml-4">
                    <span className="block font-semibold text-gray-900">{option.title}</span>
                    <span className="block text-sm text-gray-500">{option.subtitle}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-8">
              <ContinueButton disabled={!goal} onClick={() => setStep(2)}>
                Continue →
              </ContinueButton>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="fade-in">
            <h1 className="text-2xl font-bold">Choose your native language</h1>
            <p className="mt-2 text-sm text-gray-500">
              Flashcard meanings and explanations will use this language.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {LANGUAGES.map((option) => (
                <button
                  key={option.code}
                  onClick={() => setLanguage(option.name)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    language === option.name
                      ? 'border-2 border-brand-primary bg-white text-brand-primary'
                      : 'border border-gray-200 bg-white text-gray-700 hover:border-brand-primary'
                  }`}
                >
                  <span className="text-xs text-gray-400">{option.code}</span>
                  <span className="ml-2">{option.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-8">
              <ContinueButton disabled={!language} onClick={() => setStep(3)}>
                Continue →
              </ContinueButton>
            </div>
          </section>
        )}

        {step >= 3 && step <= 6 && (
          <section className="fade-in">
            {(() => {
              const questionIndex = step - 3;
              const question = QUESTIONS[questionIndex];
              const selected = answers[questionIndex];

              return (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
                      LEVEL CHECK - {questionIndex + 1} OF 4
                    </span>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                      {question.category}
                    </span>
                  </div>

                  <h2 className="mb-6 text-xl font-bold text-gray-900">{question.text}</h2>

                  {question.options.map((option, index) => (
                    <button
                      key={option}
                      onClick={() =>
                        setAnswers((current) => ({
                          ...current,
                          [questionIndex]: index,
                        }))
                      }
                      className={`mb-3 w-full rounded-xl border p-4 text-left transition-colors ${
                        selected === index
                          ? 'border-brand-primary bg-brand-primary-light'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-3 text-sm text-gray-400">{OPTION_LABELS[index]}.</span>
                      <span className="text-gray-800">{option}</span>
                    </button>
                  ))}

                  <div className="mt-5">
                    <ContinueButton
                      disabled={selected === undefined}
                      onClick={() => continueFromQuestion(questionIndex)}
                    >
                      {step === 6 ? 'See my level →' : 'Continue →'}
                    </ContinueButton>
                  </div>
                </>
              );
            })()}
          </section>
        )}

        {step === 7 && (
          <section className="fade-in text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-brand-primary">
              <span className="text-2xl font-bold text-white">{level}</span>
            </div>

            <h1 className="mt-4 text-2xl font-bold">
              You&apos;re at{' '}
              <span className="text-brand-primary">
                {level} - {levelName}
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              LearnClip will start from here and adjust as you answer quizzes.
            </p>

            <div className="mt-6 rounded-xl border border-gray-100 bg-white p-5 text-left">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                YOUR PROFILE
              </p>
              {[
                { label: 'Goal', value: selectedGoal?.title ?? 'Not selected' },
                { label: 'Native language', value: selectedLanguage?.name ?? 'Not selected' },
                { label: 'Level check', value: `${score} / ${QUESTIONS.length}` },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-gray-50 py-3 last:border-0"
                >
                  <span className="text-sm text-gray-500">{row.label}</span>
                  <span className="text-sm font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              {QUESTIONS.map((question, index) => {
                const correct = answers[index] === question.correct;

                return (
                  <div
                    key={question.category}
                    className={`flex-1 rounded-xl p-3 text-center text-xs font-medium ${
                      correct ? 'bg-success-light text-success' : 'bg-error-light text-error'
                    }`}
                  >
                    {correct ? '✓' : '×'}
                    <br />
                    <span className="text-gray-500">{question.category}</span>
                    <br />
                    {question.level}
                  </div>
                );
              })}
            </div>

            <PrimaryButton className="mt-8" disabled={saving} onClick={finish}>
              {saving ? 'Saving...' : 'Start learning'}
            </PrimaryButton>
          </section>
        )}
      </div>
    </main>
  );
}
