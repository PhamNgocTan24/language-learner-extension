'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { submitAnswer } from '@/app/actions/quiz';
import CategoryBadge from '@/components/ui/CategoryBadge';
import type { Quiz } from '@/lib/types';
import QuizComplete from './QuizComplete';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface QuizOverlayProps {
  quizzes: Quiz[];
  onClose: () => void;
}

function getAnswerIndex(answer?: string | null): number {
  if (!answer) return -1;
  const first = answer.trim().charAt(0).toUpperCase();
  return OPTION_LABELS.indexOf(first);
}

function getOptionText(option: string): string {
  return option.replace(/^[A-D][.)]\s*/i, '');
}

function isCorrect(quiz: Quiz): boolean {
  if (typeof quiz.isCorrect === 'boolean') return quiz.isCorrect;
  const correct = getAnswerIndex(quiz.correct);
  const answer = getAnswerIndex(quiz.userAnswer);
  return correct >= 0 && answer === correct;
}

export default function QuizOverlay({ quizzes: initialQuizzes, onClose }: QuizOverlayProps) {
  const firstUnanswered = initialQuizzes.findIndex((quiz) => !quiz.userAnswer);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [currentIndex, setCurrentIndex] = useState(firstUnanswered >= 0 ? firstUnanswered : 0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(firstUnanswered < 0);
  const advanceTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    };
  }, []);

  const currentQuiz = quizzes[currentIndex];

  async function selectAnswer(index: number) {
    if (!currentQuiz || currentQuiz.userAnswer || submitting) return;

    const answer = OPTION_LABELS[index];
    setSelectedIndex(index);
    setSubmitting(true);

    const result = await submitAnswer(currentQuiz.id, answer);
    const updatedQuiz =
      result ??
      ({
        ...currentQuiz,
        userAnswer: answer,
        isCorrect:
          getAnswerIndex(currentQuiz.correct) >= 0
            ? getAnswerIndex(currentQuiz.correct) === index
            : null,
      } satisfies Quiz);

    setQuizzes((current) =>
      current.map((quiz) => (quiz.id === currentQuiz.id ? updatedQuiz : quiz)),
    );
    setSubmitting(false);

    advanceTimer.current = window.setTimeout(() => {
      if (currentIndex >= quizzes.length - 1) {
        setIsComplete(true);
        return;
      }

      setCurrentIndex((current) => current + 1);
      setSelectedIndex(null);
    }, 900);
  }

  function getOptionClasses(index: number): string {
    if (!currentQuiz) return 'border-gray-200 bg-white';

    const correctIndex = getAnswerIndex(currentQuiz.correct);
    const answeredIndex = getAnswerIndex(currentQuiz.userAnswer);
    const activeIndex = selectedIndex ?? answeredIndex;

    if (!currentQuiz.userAnswer) {
      return activeIndex === index
        ? 'border-brand-primary bg-brand-primary-light text-gray-900'
        : 'border-gray-200 bg-white hover:border-gray-300';
    }

    if (correctIndex === index || (correctIndex < 0 && activeIndex === index && isCorrect(currentQuiz))) {
      return 'border-success bg-success-light text-success font-medium';
    }

    if (activeIndex === index) {
      return 'border-error bg-error-light text-error';
    }

    return 'border-gray-100 bg-gray-50 text-gray-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-page">
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center gap-2">
          {quizzes.map((quiz, index) => {
            const complete = isComplete || index < currentIndex;
            const dotClass = complete
              ? isCorrect(quiz)
                ? 'bg-success'
                : 'bg-error'
              : index === currentIndex
                ? 'bg-brand-primary'
                : 'bg-gray-200';

            return (
              <div
                key={quiz.id}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${dotClass}`}
              />
            );
          })}
          <span className="ml-2 text-sm text-gray-500">
            {isComplete ? 'Complete' : `Question ${currentIndex + 1} of ${quizzes.length}`}
          </span>
        </div>
        <button onClick={onClose} aria-label="Close quiz">
          <X size={18} className="text-gray-400 transition-colors hover:text-gray-700" />
        </button>
      </div>

      {isComplete ? (
        <QuizComplete quizzes={quizzes} onDone={onClose} />
      ) : (
        currentQuiz && (
          <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6">
            <div>
              <CategoryBadge category={currentQuiz.category ?? 'Vocabulary'} />
              <h2 className="mb-8 mt-4 text-xl font-bold text-gray-900">
                {currentQuiz.question}
              </h2>

              <div className="space-y-3">
                {currentQuiz.options.map((option, index) => (
                  <button
                    key={`${currentQuiz.id}-${option}`}
                    onClick={() => selectAnswer(index)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${getOptionClasses(
                      index,
                    )}`}
                  >
                    <span className="mr-3 text-sm text-gray-400">{OPTION_LABELS[index]}.</span>
                    {getOptionText(option)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
