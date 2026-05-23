'use client';

import type { Quiz } from '@/lib/types';
import QuizOverlay from './QuizOverlay';

interface DailyQuizSessionProps {
  quizzes: Quiz[];
  onClose: () => void;
}

export default function DailyQuizSession({ quizzes, onClose }: DailyQuizSessionProps) {
  return <QuizOverlay quizzes={quizzes} onClose={onClose} />;
}
