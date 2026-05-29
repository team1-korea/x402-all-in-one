import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Slide07IphoneStory from './Slide07IphoneStory'

describe('Slide07IphoneStory', () => {
  it('제목을 렌더링한다', () => {
    render(<Slide07IphoneStory animKey={0} />)
    expect(screen.getByText('아이폰 사러 애플스토어 가기')).toBeInTheDocument()
  })

  it('step=0이면 모든 프레임이 흐릿하게 표시된다', () => {
    const { container } = render(<Slide07IphoneStory animKey={0} step={0} />)
    const frames = container.querySelectorAll('[data-testid="story-frame"]')
    frames.forEach((frame) => {
      expect(frame).toHaveStyle({ opacity: '0.12' })
    })
  })

  it('step=3이면 첫 3개 프레임만 완전히 표시된다', () => {
    const { container } = render(<Slide07IphoneStory animKey={0} step={3} />)
    const frames = container.querySelectorAll('[data-testid="story-frame"]')
    expect(frames[0]).toHaveStyle({ opacity: '1' })
    expect(frames[1]).toHaveStyle({ opacity: '1' })
    expect(frames[2]).toHaveStyle({ opacity: '1' })
    expect(frames[3]).toHaveStyle({ opacity: '0.12' })
  })

  it('step=5이면 row2 첫 프레임이 표시된다', () => {
    const { container } = render(<Slide07IphoneStory animKey={0} step={5} />)
    const frames = container.querySelectorAll('[data-testid="story-frame"]')
    expect(frames[4]).toHaveStyle({ opacity: '1' })
    expect(frames[5]).toHaveStyle({ opacity: '0.12' })
    expect(frames[6]).toHaveStyle({ opacity: '0.12' })
  })

  it('7개 프레임 캡션을 모두 렌더링한다', () => {
    render(<Slide07IphoneStory animKey={0} step={7} />)
    expect(screen.getByText('아 아이폰 사고 싶다')).toBeInTheDocument()
    expect(screen.getByText('아이폰 수령!')).toBeInTheDocument()
  })
})
