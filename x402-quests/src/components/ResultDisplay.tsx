interface ResultDisplayProps {
  correct: boolean;
  message: string;
}

export default function ResultDisplay({ correct, message }: ResultDisplayProps) {
  return (
    <div className={`mt-6 p-4 rounded-lg border text-center ${
      correct
        ? 'bg-green-950 border-green-600 text-green-300'
        : 'bg-red-950 border-red-600 text-red-300'
    }`}>
      <p className="text-2xl mb-2">{correct ? '🎉' : '❌'}</p>
      <p>{message}</p>
    </div>
  );
}
