import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchQuest } from '../api';
import type { QuestData } from '../types';
import TheoryQuiz from '../quests/TheoryQuiz';
import StaffCodeQuest from '../quests/StaffCodeQuest';
import FeedbackQuest from '../quests/FeedbackQuest';
import InterestsQuest from '../quests/InterestsQuest';
import SnowmanSabotageQuest from '../quests/SnowmanSabotageQuest';
import BlockBuilderQuest from '../quests/BlockBuilderQuest';
import ThreeJsQuest from '../quests/ThreeJsQuest';

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'https://x402.abcfe.net';

function useMarathonStarted() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/marathon/status`);
        const data = await res.json() as { started: boolean };
        if (data.started) setStarted(true);
      } catch { /* ignore */ }
    };
    check();
    const id = setInterval(check, 2000);
    return () => clearInterval(id);
  }, [started]);

  return started;
}

export default function QuestPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const [quest, setQuest] = useState<QuestData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const marathonStarted = useMarathonStarted();

  useEffect(() => {
    if (!uuid) return;
    fetchQuest(uuid)
      .then(setQuest)
      .catch((e: Error) => setError(e.message));
  }, [uuid]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-5xl mb-4">404</p>
        <p className="text-slate-400">{error}</p>
        <p className="text-slate-600 text-sm mt-2">x402로 퀘스트를 구매하면 고유 URL을 받을 수 있습니다</p>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500 animate-pulse">퀘스트 로딩 중...</p>
      </div>
    );
  }

  if (!marathonStarted && !quest.entryPoint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 gap-4">
        <div style={{ fontSize: 48 }}>🏁</div>
        <p style={{ fontSize: 24, fontWeight: 600, color: '#1A1A1A' }}>퀘스트 준비 완료</p>
        <p style={{ color: '#7A9E87', fontSize: 14 }}>발표자가 마라톤을 시작하면 자동으로 열립니다</p>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#C4714A',
                animation: `pulse 1.2s ease-in-out ${i * 0.4}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const props = { quest };

  if (quest.questType === 'drag-drop') {
    return <BlockBuilderQuest {...props} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {(quest.questType === 'theory-ox' || quest.questType === 'theory-mc') && (
        <TheoryQuiz {...props} />
      )}
      {quest.questType === 'snowman-sabotage' && <SnowmanSabotageQuest {...props} />}
      {quest.questType === 'staff-code' && <StaffCodeQuest {...props} />}
      {quest.questType === 'feedback' && <FeedbackQuest {...props} />}
      {quest.questType === 'interests' && <InterestsQuest {...props} />}
      {quest.questType === 'threejs' && <ThreeJsQuest {...props} />}
    </div>
  );
}
