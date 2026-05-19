interface ExplanationPanelProps {
  isCorrect: boolean;
  correct: string;
  explanation: string;
}

export default function ExplanationPanel({ isCorrect, correct, explanation }: ExplanationPanelProps) {
  return (
    <div className={`mt-4 rounded-xl p-4 text-sm ${
      isCorrect ? 'bg-success-light text-success' : 'bg-error-light text-error'
    }`}>
      <p className="font-medium mb-1">
        {isCorrect ? '✅ Correct!' : `❌ The correct answer is ${correct}.`}
      </p>
      <p className="text-gray-700">{explanation}</p>
    </div>
  );
}
