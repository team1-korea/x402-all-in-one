import { type ReactNode } from 'react'

interface Props { animKey: number }

const hints: [string, string, ReactNode][] = [
  ['①', '몇 번 응답?', '이 프로토콜 이름이기도 한 HTTP 상태 코드'],
  ['②', '응답에 뭐가 있나?', '체인, 금액, 수신 지갑 — "가격표 + 계좌번호"'],
  ['③', 'to 필드?', <><code className="bg-forest/10 px-1.5 py-0.5 rounded text-forest font-mono text-xs">accepts[0]</code>의 수신자 주소 필드명</>],
  ['④', 'value 필드?', <><code className="bg-forest/10 px-1.5 py-0.5 rounded text-forest font-mono text-xs">accepts[0]</code>의 금액 필드명</>],
  ['⑤', 'validBefore?', '지금 + maxTimeoutSeconds초'],
  ['⑥', '인코딩 방식?', 'JSON → 바이너리 → 텍스트'],
  ['⑦', '누가 검증?', '네트워크 정보 테이블에 있음'],
]

const Slide08Hints = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-terracotta" style={{ width: '35vw', height: '35vw', top: '-5%', left: '-5%', opacity: 0.04, animationDelay: '-2s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-3" style={{ animationDelay: '0s' }}>06 · Lab</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-2" style={{ animationDelay: '0.2s' }}>구멍 채우기</h2>
      <p className="fade-in-stagger font-sans font-light text-sm text-sage mb-5" style={{ animationDelay: '0.4s' }}>
        x402-pay/SKILL.md 열고 [TODO] 부분을 자연어로 채우세요
      </p>
      <table className="fade-in-stagger w-full text-sm" style={{ animationDelay: '0.6s', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['#', '구멍', '힌트'].map(h => (
              <th key={h} className="bg-forest/10 text-forest font-mono text-xs tracking-wider uppercase px-4 py-2 text-left border-b border-forest/20">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hints.map(([n, hole, hint]) => (
            <tr key={n} className="border-b border-sage/10">
              <td className="px-4 py-2 font-mono text-terracotta text-xs">{n}</td>
              <td className="px-4 py-2 text-dark/80 font-sans">{hole}</td>
              <td className="px-4 py-2 text-dark/70 font-sans">{hint}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="fade-in-stagger w-full mt-4 bg-forest/10 border border-forest/20 rounded-xl px-5 py-3 font-sans text-sm text-forest" style={{ animationDelay: '1.0s' }}>
        정확하지 않아도 됩니다 — 비슷한 의미면 Claude가 알아서 해석합니다
      </div>
    </div>
  </div>
)

export default Slide08Hints
