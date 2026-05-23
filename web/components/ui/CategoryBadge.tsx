const categoryColors: Record<string, string> = {
  Vocabulary: 'bg-brand-primary-light text-brand-primary',
  Phrase: 'bg-accent-light text-accent-hover',
  Grammar: 'bg-purple-50 text-purple-700',
  Idiom: 'bg-teal-50 text-teal-700',
};

interface CategoryBadgeProps {
  category?: string | null;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const label = category === 'Pronunciation' ? 'Vocabulary' : (category ?? 'Vocabulary');
  const color = categoryColors[label] ?? 'bg-gray-100 text-gray-600';

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
