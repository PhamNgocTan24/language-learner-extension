import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'LearnClip',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-gray-100">
        <span className="text-lg font-semibold text-brand-primary">📌 LearnClip</span>
        <a
          href={`${API_URL}/auth/google`}
          className="bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          Get Started Free
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-8 py-24 gap-6">
        <div className="text-5xl">📌</div>
        <h1 className="text-2xl font-semibold tracking-tight max-w-2xl leading-tight md:text-4xl">
          Save English.<br />Quiz Yourself Later.
        </h1>
        <p className="text-base text-gray-500 max-w-lg">
          Highlight any word or phrase while reading. LearnClip saves it with context
          and generates a quiz — exactly when you need it.
        </p>
        <a
          href={`${API_URL}/auth/google`}
          className="bg-accent hover:bg-accent-hover text-white font-medium px-6 py-2.5 rounded-md text-sm transition-colors mt-2"
        >
          Sign in with Google — Free
        </a>
        <p className="text-sm text-gray-500">No credit card. 20 saves/month free forever.</p>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8 pb-24 max-w-4xl mx-auto w-full">
        {[
          { icon: '🔍', title: 'Highlight anything', desc: 'Works on any website. Just select text and click Save.' },
          { icon: '🧠', title: 'AI-generated quizzes', desc: 'A multiple-choice question is generated from your exact context.' },
          { icon: '📈', title: 'Track your progress', desc: 'Your level adapts based on your quiz accuracy over time.' },
        ].map((f) => (
          <div key={f.title} className="border border-gray-100 rounded-xl p-5">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-base font-medium mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
