import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateQuiz } from '@/app/actions/quiz';
import QuizCard from '@/components/quiz/QuizCard';

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
      <div className="flex min-h-screen items-center justify-center bg-surface-page px-4 text-center">
        <div>
          <p className="mb-4 text-base text-gray-500">
            Failed to generate quiz. Please try again.
          </p>
          <Link href="/dashboard" className="text-sm text-brand-primary hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <QuizCard quiz={quiz} />;
}
