'use client';

import { useState } from 'react';
import Link from 'next/link';
import { submitAnswer } from '@/app/actions/quiz';
import AnswerOption from './AnswerOption';
import ExplanationPanel from './ExplanationPanel';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Quiz } from '@/lib/types';

interface QuizCardProps {
  quiz: Quiz;
}

export default function QuizCard({ quiz: initial }: QuizCardProps) {
  const [quiz, setQuiz] = useState<Quiz>(initial);
  const [selected, setSelected] = useState<string | null>(initial.userAnswer ?? null);
  const [submitted, setSubmitted] = useState(!!initial.userAnswer);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!selected || submitting) return;
    setSubmitting(true);
    const result = await submitAnswer(quiz.id, selected);
    if (result) {
      setQuiz(result);
      setSubmitted(true);
    }
    setSubmitting(false);
  }

  return (
    <Card>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Quiz</p>
      <h2 className="text-lg font-medium mb-6 leading-snug">{quiz.question}</h2>

      <div className="flex flex-col gap-3">
        {quiz.options.map((option) => {
          const letter = option.charAt(0);
          return (
            <AnswerOption
              key={option}
              option={option}
              letter={letter}
              selected={selected === letter}
              submitted={submitted}
              isCorrect={submitted && letter === quiz.correct}
              isWrong={submitted && letter === selected && letter !== quiz.correct}
              onClick={() => !submitted && setSelected(letter)}
            />
          );
        })}
      </div>

      {submitted && quiz.correct && quiz.explanation && (
        <ExplanationPanel
          isCorrect={!!quiz.isCorrect}
          correct={quiz.correct}
          explanation={quiz.explanation}
        />
      )}

      <div className="mt-6">
        {!submitted ? (
          <Button
            fullWidth
            disabled={!selected || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Checking...' : 'Submit answer'}
          </Button>
        ) : (
          <Link
            href="/dashboard"
            className="block text-center bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2 rounded-md transition-colors"
          >
            Back to saves →
          </Link>
        )}
      </div>
    </Card>
  );
}
