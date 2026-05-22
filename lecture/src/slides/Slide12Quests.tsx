interface Props { animKey: number }

const quests = [
  { id: '1', price: '10 USDC', type: '드래그앤드롭 — x402 흐름 순서 맞추기' },
  { id: '2', price: '10 USDC', type: 'OX — Claude 스킬 시스템' },
  { id: '3', price: '10 USDC', type: 'OX — x402 프로토콜 이론' },
  { id: '4', price: '10 USDC', type: '게임 — 아발란체 합의를 방해하라' },
  { id: '5', price: '10 USDC', type: '객관식 — Anthropic & Claude 모델' },
  { id: '6', price: '10 USDC', type: '오프라인 — 스태프 찾아 비밀코드 받기' },
  { id: '7', price: '10 USDC', type: '객관식 — Kite AI & 아발란체 생태계' },
  { id: '8', price: '10 USDC', type: '정렬 — x402 결제 흐름 순서 맞추기' },
  { id: '9', price: '10 USDC', type: '네트워킹 — 참가자 3명 관심사 모으기' },
  { id: '10', price: '10 USDC', type: '피드백 — 오늘 밋업 한 줄 소감' },
]

const Slide12Quests = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-sage" style={{ width: '40vw', height: '40vw', bottom: '-8%', left: '-5%', opacity: 0.07, animationDelay: '-5s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-5xl content-z-index">
      <p className="fade-in-stagger font-mono text-sm tracking-widest uppercase text-sage mb-5" style={{ animationDelay: '0s' }}>08 · Marathon — 퀘스트 구성</p>
      <h2 className="fade-in-stagger font-serif text-6xl text-dark mb-7" style={{ animationDelay: '0.2s' }}>10개 퀘스트</h2>
      <table className="fade-in-stagger w-full mb-6" style={{ animationDelay: '0.5s', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['#', '가격', '내용'].map(h => (
              <th key={h} className="bg-forest/10 text-forest font-mono text-sm tracking-wider uppercase px-4 py-3 text-left border-b border-forest/20">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quests.map(({ id, price, type }) => (
            <tr key={id} className="border-b border-sage/10">
              <td className="px-4 py-2 font-mono text-sm text-terracotta">{id}</td>
              <td className="px-4 py-2 font-sans text-sm whitespace-nowrap">
                <strong className="text-terracotta font-medium">{price}</strong>
              </td>
              <td className="px-4 py-2 text-sm text-dark/70 font-sans">{type}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="fade-in-stagger w-full bg-cream/70 border border-forest/20 rounded-xl px-7 py-5 font-sans text-lg text-dark/80" style={{ animationDelay: '0.9s' }}>
        Top 3 완주자에게 <strong className="font-medium text-dark">특별 선물</strong> 있습니다
      </div>
    </div>
  </div>
)

export default Slide12Quests
