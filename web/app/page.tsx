import type { Metadata } from 'next';
import { Brain, MousePointerClick, TrendingUp } from 'lucide-react';
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

      <section className="fade-in">
        <PageWrapper size="landing" className="pb-16 pt-24 text-center">
          <div className="mx-auto inline-flex rounded-full border border-accent-light bg-accent-light px-4 py-1.5 text-xs font-medium text-accent-hover">
            Chrome Extension - Free forever
          </div>

          <div className="mt-8 flex justify-center">
            <Logo markOnly size="lg" />
          </div>

          <h1 className="mx-auto mt-8 max-w-2xl text-5xl font-extrabold leading-tight md:text-6xl">
            Save English. <span className="text-accent">Quiz</span>
            <br />
            <span className="text-accent">Yourself</span> Later.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-500">
            Highlight English while browsing, save it with context, and turn your own reading into
            quick flashcards and quizzes.
          </p>

          <a
            href={`${API_URL}/auth/google`}
            className="mx-auto mt-8 flex max-w-sm items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <GoogleIcon />
            Sign in with Google - Free
          </a>

          <p className="mt-3 text-xs text-gray-400">
            No credit card. 20 saves/month free forever.
          </p>
        </PageWrapper>
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
