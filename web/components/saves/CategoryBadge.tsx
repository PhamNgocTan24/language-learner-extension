const categoryColors: Record<string, string> = {
  Vocabulary:    'bg-brand-primary-light text-brand-primary',
  Phrase:        'bg-accent-light text-accent-hover',
  Grammar:       'bg-purple-50 text-purple-700',
  Idiom:         'bg-teal-50 text-teal-700',
  Pronunciation: 'bg-gray-100 text-gray-600',
};

interface CategoryBadgeProps {
  category: string;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const color = categoryColors[category] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {category}
    </span>
  );
}
