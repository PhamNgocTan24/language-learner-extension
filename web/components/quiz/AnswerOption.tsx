'use client';

interface AnswerOptionProps {
  option: string;
  letter: string;
  selected: boolean;
  submitted: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  onClick: () => void;
}

export default function AnswerOption({
  option,
  selected,
  submitted,
  isCorrect,
  isWrong,
  onClick,
}: AnswerOptionProps) {
  let cls = 'border border-gray-200 hover:border-brand-primary hover:bg-brand-primary-light';

  if (submitted) {
    if (isCorrect)     cls = 'border border-success bg-success-light text-success font-medium';
    else if (isWrong)  cls = 'border border-error bg-error-light text-error';
    else               cls = 'border border-gray-100 opacity-50';
  } else if (selected) {
    cls = 'border border-brand-primary bg-brand-primary-light';
  }

  return (
    <button
      disabled={submitted}
      onClick={onClick}
      className={`w-full text-left rounded-md p-4 text-sm transition-colors disabled:cursor-default ${cls}`}
    >
      {option}
    </button>
  );
}
