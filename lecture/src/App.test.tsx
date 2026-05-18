import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

vi.mock('./slides/Slide01Title', () => ({ default: (_p: object) => <div data-testid="slide-0" /> }))
vi.mock('./slides/Slide02Agenda', () => ({ default: (_p: object) => <div data-testid="slide-1" /> }))
vi.mock('./slides/Slide03Skills', () => ({ default: (_p: object) => <div data-testid="slide-2" /> }))
vi.mock('./slides/Slide04Install', () => ({ default: (_p: object) => <div data-testid="slide-3" /> }))
vi.mock('./slides/Slide05Verify', () => ({ default: (_p: object) => <div data-testid="slide-4" /> }))
vi.mock('./slides/Slide06OpenGuide', () => ({ default: (_p: object) => <div data-testid="slide-5" /> }))
vi.mock('./slides/Slide07IphoneStory', () => ({ default: (_p: object) => <div data-testid="slide-6" /> }))
vi.mock('./slides/Slide08Comparison', () => ({ default: (_p: object) => <div data-testid="slide-7" /> }))
vi.mock('./slides/Slide09Hints', () => ({ default: (_p: object) => <div data-testid="slide-8" /> }))
vi.mock('./slides/Slide10Test', () => ({ default: (_p: object) => <div data-testid="slide-9" /> }))
vi.mock('./slides/Slide11Go', () => ({ default: (_p: object) => <div data-testid="slide-10" /> }))
vi.mock('./slides/Slide12Quests', () => ({ default: (_p: object) => <div data-testid="slide-11" /> }))
vi.mock('./slides/Slide13Leaderboard', () => ({ default: (_p: object) => <div data-testid="slide-12" /> }))
vi.mock('./slides/Slide14Bonus', () => ({ default: (_p: object) => <div data-testid="slide-13" /> }))

describe('App navigation', () => {
  beforeEach(() => {
    render(<App />)
  })

  it('renders 14 dot indicators', () => {
    expect(screen.getAllByRole('button')).toHaveLength(14)
  })

  it('shows slide 1 / 14 initially', () => {
    expect(screen.getByText('1 / 14')).toBeInTheDocument()
  })

  it('ArrowRight advances to slide 2', () => {
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('2 / 14')).toBeInTheDocument()
  })

  it('ArrowLeft does not go below slide 1', () => {
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('1 / 14')).toBeInTheDocument()
  })

  it('does not exceed slide 14 on ArrowRight spam', () => {
    for (let i = 0; i < 40; i++) fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('14 / 14')).toBeInTheDocument()
  })
})
