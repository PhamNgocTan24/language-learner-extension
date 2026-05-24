export default function QuizLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page">
      <div className="rounded-xl border border-gray-100 bg-white px-6 py-5 text-center">
        <p className="text-sm text-gray-500">Generating your quiz...</p>
      </div>
    </div>
  );
}
