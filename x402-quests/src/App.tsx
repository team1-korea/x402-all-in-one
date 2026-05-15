import { Routes, Route } from 'react-router-dom';
import QuestPage from './pages/QuestPage';

export default function App() {
  return (
    <Routes>
      <Route path="/quest/:uuid" element={<QuestPage />} />
      <Route path="*" element={
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-500">잘못된 접근입니다. Claude에게 퀘스트 URL을 요청하세요.</p>
        </div>
      } />
    </Routes>
  );
}
