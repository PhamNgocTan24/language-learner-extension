'use client';

import { useState } from 'react';
import Link from 'next/link';
import { deleteSave } from '@/app/actions/saves';
import CategoryBadge from './CategoryBadge';
import Button from '@/components/ui/Button';
import type { Save } from '@/lib/types';

interface SavesListProps {
  initialSaves: Save[];
}

export default function SavesList({ initialSaves }: SavesListProps) {
  const [saves, setSaves] = useState<Save[]>(initialSaves);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteSave(id);
      setSaves((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  if (saves.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-base text-gray-500">No saves yet.</p>
        <p className="text-sm text-gray-500 mt-1">
          Install the Chrome extension and highlight text on any page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {saves.map((save) => (
        <div
          key={save.id}
          className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 flex gap-4 items-start shadow-sm"
        >
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-gray-900 truncate">{save.text}</p>
            {save.sentence && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{save.sentence}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {save.category && <CategoryBadge category={save.category} />}
              {save.sourceTitle && (
                <span className="text-xs text-gray-500 truncate">{save.sourceTitle}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Link
              href={`/dashboard/quiz/${save.id}`}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              Quiz me
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(save.id)}
              disabled={deletingId === save.id}
            >
              {deletingId === save.id ? '...' : 'Delete'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
