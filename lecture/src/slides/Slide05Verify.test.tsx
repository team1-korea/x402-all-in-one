import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Slide05Verify from './Slide05Verify'

describe('Slide05Verify', () => {
  it('제목을 렌더링한다', () => {
    render(<Slide05Verify animKey={0} />)
    expect(screen.getByText('제대로 설치됐나요?')).toBeInTheDocument()
  })

  it('세 가지 스킬 배지를 렌더링한다', () => {
    render(<Slide05Verify animKey={0} />)
    expect(screen.getByText('x402-pay')).toBeInTheDocument()
    expect(screen.getByText('x402-discover')).toBeInTheDocument()
    expect(screen.getByText('x402-quest')).toBeInTheDocument()
  })

  it('파일 경로 트리를 렌더링한다', () => {
    render(<Slide05Verify animKey={0} />)
    expect(screen.getByText(/team1-x402/)).toBeInTheDocument()
    expect(screen.getByText(/x402-pay\/SKILL\.md/)).toBeInTheDocument()
  })

  it('트러블슈팅 섹션을 렌더링한다', () => {
    render(<Slide05Verify animKey={0} />)
    expect(screen.getByText(/목록에 없다/)).toBeInTheDocument()
    expect(screen.getByText(/그래도 안 됨/)).toBeInTheDocument()
  })
})
