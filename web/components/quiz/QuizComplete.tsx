'use client';

import { CheckCircle, XCircle } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import type { Quiz } from '@/lib/types';

interface QuizCompleteProps {
  quizzes: Quiz[];
  onDone: () => void;
}

function isCorrect(quiz: Quiz): boolean {
  if (typeof quiz.isCorrect === 'boolean') return quiz.isCorrect;
  if (!quiz.correct || !quiz.userAnswer) return false;
  return quiz.correct.toUpperCase().startsWith(quiz.userAnswer.toUpperCase());
}

export default function QuizComplete({ quizzes, onDone }: QuizCompleteProps) {
  const score = quizzes.filter(isCorrect).length;
  const total = quizzes.length;
  const title = score === total ? 'Perfect!' : score >= total / 2 ? 'Good job!' : 'Keep practicing!';

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-24 w-24 flex-col items-center justify-center rounded-full bg-brand-primary-light">
          <span className="text-3xl font-bold text-brand-primary">{score}</span>
          <span className="text-xs text-brand-primary-text">/{total}</span>
        </div>

        <h2 className="mt-5 text-2xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">
          You got {score} out of {total} correct.
        </p>

        <div className="mt-8 w-full space-y-2 text-left">
          {quizzes.map((quiz, index) => {
            const correct = isCorrect(quiz);

            return (
              <div
                key={quiz.id}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4"
              >
                {correct ? (
                  <CheckCircle size={18} className="shrink-0 text-success" />
                ) : (
                  <XCircle size={18} className="shrink-0 text-error" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {quiz.word ?? `Question ${index + 1}`}
                  </p>
                  <p className="line-clamp-2 text-xs text-gray-500">
                    {quiz.meaning ?? quiz.explanation ?? quiz.question}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <PrimaryButton className="mt-8" onClick={onDone}>
          Back to Dashboard
        </PrimaryButton>
      </div>
    </div>
  );
}
