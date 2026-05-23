'use client';

import { RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import CategoryBadge from '@/components/ui/CategoryBadge';
import type { Flashcard } from '@/lib/types';

interface FlashcardModalProps {
  flashcard: Flashcard | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export default function FlashcardModal({
  flashcard,
  loading,
  error,
  onClose,
}: FlashcardModalProps) {
  const [flipped, setFlipped] = useState(false);
  const shouldShowPronunciation =
    flashcard?.category !== 'Grammar' && Boolean(flashcard?.pronunciation);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute right-6 top-6 flex items-center gap-1.5 text-sm text-white/80 transition-colors hover:text-white"
      >
        <X size={16} /> Close
      </button>

      <button
        onClick={() => flashcard && setFlipped((current) => !current)}
        className="perspective-card w-full max-w-md cursor-pointer text-left"
      >
        <div
          className={`flashcard-min-h preserve-3d relative transition-transform duration-500 ease-in-out ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white p-8 text-center shadow-sm">
            {loading && <p className="text-sm text-gray-500">Loading flashcard...</p>}
            {error && <p className="text-sm text-error">{error}</p>}
            {flashcard && (
              <>
                <CategoryBadge category={flashcard.category} />
                <p className="mt-6 text-4xl font-bold text-gray-900">{flashcard.text}</p>
                {shouldShowPronunciation && (
                  <p className="mt-2 font-mono text-base text-gray-400">
                    {flashcard.pronunciation}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-1.5 pt-8 text-sm text-gray-400">
                  <RefreshCw size={14} /> Tap to reveal meaning
                </div>
              </>
            )}
          </div>

          <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-center rounded-xl bg-brand-primary p-8 shadow-sm">
            {flashcard && (
              <>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-primary-light">
                  MEANING
                </p>
                <p className="text-2xl font-bold leading-tight text-white">
                  {flashcard.meaning}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-brand-primary-light">
                  {flashcard.usage}
                </p>
                <div className="mt-6 border-t border-white/20 pt-5">
                  <p className="text-sm italic leading-relaxed text-white/90">
                    &quot;{flashcard.example}&quot;
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </button>

      <p className="mt-4 text-xs text-white/50">Tap card to flip</p>
    </div>
  );
}
