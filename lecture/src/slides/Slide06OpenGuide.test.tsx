import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Slide06OpenGuide from './Slide06OpenGuide'

describe('Slide06OpenGuide', () => {
  it('제목을 렌더링한다', () => {
    render(<Slide06OpenGuide animKey={0} />)
    expect(screen.getByText('SKILL.md 열기')).toBeInTheDocument()
  })

  it('4가지 열기 방법을 모두 렌더링한다', () => {
    render(<Slide06OpenGuide animKey={0} />)
    expect(screen.getByText('VSCode')).toBeInTheDocument()
    expect(screen.getByText('메모장 / TextEdit')).toBeInTheDocument()
    expect(screen.getByText('터미널')).toBeInTheDocument()
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
  })
})
