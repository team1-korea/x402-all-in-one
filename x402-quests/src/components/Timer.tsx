import { useEffect, useState } from 'react';

interface TimerProps {
  seconds: number;
  onComplete: () => void;
}

export default function Timer({ seconds, onComplete }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onComplete]);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between text-xs text-slate-500 mb-1">
        <span>이론을 읽는 중...</span>
        <span>{remaining}s</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
