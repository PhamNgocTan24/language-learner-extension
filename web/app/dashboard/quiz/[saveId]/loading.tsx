export default function QuizLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🧠</div>
        <p className="text-sm text-gray-500">Generating your quiz...</p>
      </div>
    </div>
  );
}
