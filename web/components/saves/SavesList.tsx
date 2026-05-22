'use client';

import { useState } from 'react';
import { getFlashcard } from '@/app/actions/saves';
import { generateDailyQuiz } from '@/app/actions/quiz';
import DailyQuizSession from '@/components/quiz/DailyQuizSession';
import type { Flashcard, Quiz, Save } from '@/lib/types';
import FlashcardModal from './FlashcardModal';
import SaveItem from './SaveItem';

interface SavesListProps {
  initialSaves: Save[];
}

export default function SavesList({ initialSaves }: SavesListProps) {
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [flashcardOpen, setFlashcardOpen] = useState(false);
  const [dailyQuizzes, setDailyQuizzes] = useState<Quiz[] | null>(null);
  const [dailyMessage, setDailyMessage] = useState<string | null>(null);
  const [generatingDaily, setGeneratingDaily] = useState(false);

  async function openFlashcard(id: string) {
    setFlashcardOpen(true);
    setFlashcard(null);
    setFlashcardError(null);
    setFlashcardLoading(true);

    const result = await getFlashcard(id);
    if (result) {
      setFlashcard(result);
    } else {
      setFlashcardError('Failed to load flashcard. Please try again.');
    }
    setFlashcardLoading(false);
  }

  async function handleQuizAll() {
    setGeneratingDaily(true);
    setDailyMessage(null);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = await generateDailyQuiz(timezone);
    setGeneratingDaily(false);

    if (!result) {
      setDailyMessage('Failed to generate daily quizzes. Please try again.');
      return;
    }

    if (result.total === 0) {
      setDailyQuizzes(null);
      setDailyMessage('No saves from today yet.');
      return;
    }

    setDailyQuizzes(result.quizzes);
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Your saved highlights</h2>
        <button
          onClick={handleQuizAll}
          disabled={generatingDaily}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generatingDaily ? 'Generating...' : 'Quiz All Today'}
        </button>
      </div>

      {dailyMessage && (
        <div className="mb-4 rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm text-gray-600">
          {dailyMessage}
        </div>
      )}

      {dailyQuizzes && (
        <DailyQuizSession quizzes={dailyQuizzes} onClose={() => setDailyQuizzes(null)} />
      )}

      {initialSaves.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white py-16 text-center">
          <p className="text-base text-gray-500">No saves yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            Install the Chrome extension and highlight text on any page.
          </p>
        </div>
      ) : (
        <div>
          {initialSaves.map((save) => (
            <SaveItem key={save.id} save={save} onOpen={openFlashcard} />
          ))}
        </div>
      )}

      {flashcardOpen && (
        <FlashcardModal
          flashcard={flashcard}
          loading={flashcardLoading}
          error={flashcardError}
          onClose={() => setFlashcardOpen(false)}
        />
      )}
    </>
  );
}
