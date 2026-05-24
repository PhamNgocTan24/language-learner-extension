import { Bookmark, CheckCircle, Target } from 'lucide-react';
import type { UserStats } from '@/lib/types';

interface StatsRowProps {
  totalSaved: number;
  stats: UserStats | null;
}

export default function StatsRow({ totalSaved, stats }: StatsRowProps) {
  const items = [
    { icon: Bookmark, label: 'Total saved', value: totalSaved },
    { icon: CheckCircle, label: 'Correct answers', value: stats?.correct ?? 0 },
    { icon: Target, label: 'Accuracy', value: `${stats?.accuracy ?? 0}%` },
  ];

  return (
    <div className="mb-8 grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-gray-100 bg-white p-4">
          <div className="mb-2 flex items-center gap-2 text-gray-400">
            <item.icon size={14} />
            <span className="text-xs">{item.label}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
