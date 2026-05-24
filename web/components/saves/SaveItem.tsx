import { Trash2 } from 'lucide-react';
import type { Save } from '@/lib/types';
import CategoryBadge from '@/components/ui/CategoryBadge';

interface SaveItemProps {
  save: Save;
  deleting: boolean;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

function getSourceDomain(sourceUrl: string | null): string {
  if (!sourceUrl) return 'Saved source';

  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '');
  } catch {
    return 'Saved source';
  }
}

export default function SaveItem({ save, deleting, onOpen, onDelete }: SaveItemProps) {
  return (
    <div
      onClick={() => onOpen(save.id)}
      className="mb-3 flex w-full cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-white p-5 transition-colors hover:border-brand-primary"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="truncate font-semibold text-gray-900">{save.text}</p>
          <CategoryBadge category={save.category} />
        </div>
        {save.sentence && <p className="line-clamp-2 text-sm text-gray-500">{save.sentence}</p>}
        <p className="mt-1.5 text-xs text-gray-400">
          {save.sourceTitle ?? 'Untitled'} · {getSourceDomain(save.sourceUrl)}
        </p>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onDelete(save.id);
        }}
        disabled={deleting}
        aria-label={`Delete ${save.text}`}
        className="shrink-0 rounded-md border border-gray-200 p-2 text-gray-400 transition-colors hover:border-error hover:bg-error-light hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
