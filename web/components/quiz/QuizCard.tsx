'use client';

import { useRouter } from 'next/navigation';
import type { Quiz } from '@/lib/types';
import QuizOverlay from './QuizOverlay';

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const router = useRouter();

  return <QuizOverlay quizzes={[quiz]} onClose={() => router.replace('/dashboard')} />;
}
