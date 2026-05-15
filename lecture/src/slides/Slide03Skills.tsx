interface Props { animKey: number }

const Slide03Skills = ({ animKey }: Props) => (
  <div className="slide bg-beige content-z-index">
    <div className="ambient-shape bg-forest" style={{ width: '45vw', height: '45vw', top: '-5%', right: '-8%', opacity: 0.04, animationDelay: '-6s' }} />
    <div key={animKey} className="flex flex-col items-center w-full max-w-2xl content-z-index">
      <p className="fade-in-stagger font-mono text-xs tracking-widest uppercase text-sage mb-4" style={{ animationDelay: '0s' }}>02 · Claude Skills</p>
      <h2 className="fade-in-stagger font-serif text-5xl text-dark mb-6" style={{ animationDelay: '0.2s' }}>클로드에게 능력 심는 법</h2>
      <p className="fade-in-stagger font-sans text-xl text-dark/80 mb-6" style={{ animationDelay: '0.5s' }}>
        <code className="bg-forest/10 px-2 py-0.5 rounded text-forest font-mono text-lg">/</code>
        {' '}를 입력하면 나오는 슬래시 명령어
      </p>
      <div className="fade-in-stagger w-full bg-cream/70 border border-forest/20 rounded-xl px-6 py-5 mb-6" style={{ animationDelay: '0.8s' }}>
        <p className="font-sans text-lg text-dark">
          <strong className="font-medium">.md 파일 하나</strong> = Claude에게 새 능력 부여
        </p>
        <p className="font-sans text-sm text-sage mt-2">
          코드가 아닙니다 — Claude에게 보내는{' '}
          <strong className="text-forest font-medium">자연어 지시문</strong>입니다
        </p>
      </div>
      <pre className="fade-in-stagger w-full bg-[#1e2d24] rounded-xl px-7 py-5 font-mono text-sm text-[#d4ede0] text-left leading-7 whitespace-pre" style={{ animationDelay: '1.1s' }}>{`---
name: x402-pay
description: x402 결제를 수행합니다.
---

# 결제 방법
1단계: 유료 엔드포인트에 GET 요청...
2단계: 402 응답을 받는다...`}<span className="text-[#4a7c5f]">   ← Claude가 이걸 읽고 실행</span></pre>
    </div>
  </div>
)

export default Slide03Skills
