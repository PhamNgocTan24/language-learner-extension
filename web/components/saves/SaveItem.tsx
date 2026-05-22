import type { Save } from '@/lib/types';
import CategoryBadge from '@/components/ui/CategoryBadge';

interface SaveItemProps {
  save: Save;
  onOpen: (id: string) => void;
}

function getSourceDomain(sourceUrl: string | null): string {
  if (!sourceUrl) return 'Saved source';

  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, '');
  } catch {
    return 'Saved source';
  }
}

export default function SaveItem({ save, onOpen }: SaveItemProps) {
  return (
    <button
      onClick={() => onOpen(save.id)}
      className="mb-3 w-full cursor-pointer rounded-xl border border-gray-100 bg-white p-5 text-left transition-colors hover:border-brand-primary"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="truncate font-semibold text-gray-900">{save.text}</p>
            <CategoryBadge category={save.category} />
          </div>
          {save.sentence && (
            <p className="line-clamp-2 text-sm text-gray-500">{save.sentence}</p>
          )}
          <p className="mt-1.5 text-xs text-gray-400">
            {save.sourceTitle ?? 'Untitled'} · {getSourceDomain(save.sourceUrl)}
          </p>
        </div>
      </div>
    </button>
  );
}
