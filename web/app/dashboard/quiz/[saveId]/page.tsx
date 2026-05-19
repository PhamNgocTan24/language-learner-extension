import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { generateQuiz } from '@/app/actions/quiz';
import QuizCard from '@/components/quiz/QuizCard';
import Link from 'next/link';

interface QuizPageProps {
  params: Promise<{ saveId: string }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken');
  if (!token) redirect('/');

  const { saveId } = await params;
  const quiz = await generateQuiz(saveId);

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="text-base text-gray-500 mb-4">Failed to generate quiz. Please try again.</p>
          <Link href="/dashboard" className="text-sm text-brand-primary hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 md:px-8 py-12">
      <div className="w-full max-w-lg">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 mb-6 block transition-colors"
        >
          ← Back to dashboard
        </Link>
        {/* Client component handles answer selection and submission */}
        <QuizCard quiz={quiz} />
      </div>
    </div>
  );
}
