import type { Metadata } from 'next';
import { Bookmark, Brain, MousePointerClick, TrendingUp } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import PageWrapper from '@/components/layout/PageWrapper';
import Logo from '@/components/ui/Logo';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'LearnClip',
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-white">
      <path d="M21.8 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.2c1.9-1.7 3-4.3 3-7.4z" />
      <path d="M12 22c2.7 0 5-0.9 6.6-2.4l-3.2-2.6c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3.1v2.7A10 10 0 0 0 12 22z" />
      <path d="M6.4 13.8a6 6 0 0 1 0-3.6V7.5H3.1a10 10 0 0 0 0 9z" />
      <path d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.9 5.5l3.3 2.7C7.2 7.9 9.4 6.1 12 6.1z" />
    </svg>
  );
}

export default function LandingPage() {
  const features = [
    {
      icon: MousePointerClick,
      title: 'Highlight anything',
      desc: 'Save useful words and phrases from any page while you read.',
    },
    {
      icon: Brain,
      title: 'Quiz from context',
      desc: 'Practice with questions generated from the sentence you actually saw.',
    },
    {
      icon: TrendingUp,
      title: 'Track your level',
      desc: 'Keep saves, quiz history, and accuracy in one focused workspace.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Clip English',
      desc: 'Select a word or phrase in Chrome and save it with the surrounding context.',
    },
    {
      number: '02',
      title: 'Review meaning',
      desc: 'Open a flashcard to see pronunciation, meaning, usage, and an example.',
    },
    {
      number: '03',
      title: 'Quiz later',
      desc: 'Answer short multiple-choice quizzes and build recall from your own saves.',
    },
  ];

  return (
    <main className="min-h-screen bg-surface-page text-gray-900">
      <Navbar variant="landing" />

      <section
        style={{ background: 'radial-gradient(ellipse at 50% -10%, #dbeafe 0%, #f1f5f9 55%)' }}
        className="fade-in flex min-h-[calc(100vh-64px)] items-center"
      >
        <div className="mx-auto w-full max-w-5xl px-6 py-20">
          <div className="flex flex-row items-center gap-16 max-md:flex-col">
            <div className="flex-1 text-left max-md:text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-light bg-accent-light px-4 py-1.5 text-xs font-semibold text-accent-hover">
                ⚡ Chrome Extension — Free forever
              </div>

              <div className="mt-8 hidden justify-center max-md:flex">
                <Logo markOnly size="lg" />
              </div>

              <h1 className="mt-8 max-w-2xl text-5xl font-extrabold leading-tight max-md:mx-auto md:text-6xl">
                Save English. <span className="text-accent">Quiz</span>
                <br />
                <span className="text-accent">Yourself</span> Later.
              </h1>

              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-500 max-md:mx-auto">
                Highlight English while browsing, save it with context, and turn your own reading
                into quick flashcards and quizzes.
              </p>

              <a
                href={`${API_URL}/auth/google`}
                className="mt-8 flex max-w-sm items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 font-semibold text-white transition-colors hover:bg-accent-hover max-md:mx-auto"
              >
                <GoogleIcon />
                Sign in with Google - Free
              </a>

              <div className="mt-3 space-y-1 text-left max-md:text-center">
                <p className="text-xs text-gray-400">
                  No credit card. 20 saves/month free forever.
                </p>
                <p className="text-xs text-gray-400">
                  <span className="font-semibold text-gray-600">500+</span> learners already
                  building vocabulary from what they read
                </p>
              </div>
            </div>

            <div className="flex flex-1 justify-center max-md:hidden">
              <div
                style={{ transform: 'rotate(2deg)' }}
                className="w-72 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Bookmark size={16} className="fill-blue-500 text-blue-500" />
                  <span className="text-sm font-semibold text-gray-900">LearnClip</span>
                </div>

                <div className="mt-5">
                  <p className="text-xs text-gray-400">You highlighted</p>
                  <div className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                    compelling
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-gray-500">
                    ...making a compelling case for remote work...
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-xs text-gray-400">Category</p>
                  <div className="mt-2 flex gap-1">
                    <span className="rounded-full bg-brand-primary px-2 py-0.5 text-xs text-white">
                      Vocabulary
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      Phrase
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      Grammar
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      Idiom
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-xl bg-amber-400 py-2 text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <PageWrapper size="landing" className="grid grid-cols-1 gap-12 py-20 sm:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary-light text-brand-primary">
                <feature.icon size={22} />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </PageWrapper>
      </section>

      <section className="bg-surface-page">
        <PageWrapper size="landing" className="py-20">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">How it works</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-xl border border-gray-100 bg-white p-6">
                <p className="text-4xl font-bold text-brand-primary-light">{step.number}</p>
                <h3 className="mt-3 font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </PageWrapper>
      </section>

      <section className="bg-brand-primary py-20 text-center">
        <PageWrapper size="landing">
          <h2 className="text-3xl font-bold text-white">Start saving English today</h2>
          <p className="mt-3 text-brand-primary-light">
            A focused workspace for the words and phrases you actually meet.
          </p>
          <a
            href={`${API_URL}/auth/google`}
            className="mt-8 inline-flex rounded-full bg-white px-8 py-3 font-semibold text-brand-primary transition-colors hover:bg-brand-primary-light"
          >
            Get started - it&apos;s free
          </a>
        </PageWrapper>
      </section>
    </main>
  );
}
