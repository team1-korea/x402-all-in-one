import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  seconds: number;
  onComplete: () => void;
}

export default function Timer({ seconds, onComplete }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (remaining <= 0) {
      onCompleteRef.current();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const pct = ((seconds - remaining) / seconds) * 100;

  return (
    <div className="w-full mt-6">
      <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
        <span>이론을 읽는 중...</span>
        <span>{remaining}s</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
