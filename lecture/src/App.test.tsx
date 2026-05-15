import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'

vi.mock('./slides/Slide01Title', () => ({ default: (_p: object) => <div data-testid="slide-0" /> }))
vi.mock('./slides/Slide02Agenda', () => ({ default: (_p: object) => <div data-testid="slide-1" /> }))
vi.mock('./slides/Slide03Skills', () => ({ default: (_p: object) => <div data-testid="slide-2" /> }))
vi.mock('./slides/Slide04Install', () => ({ default: (_p: object) => <div data-testid="slide-3" /> }))
vi.mock('./slides/Slide05Explore', () => ({ default: (_p: object) => <div data-testid="slide-4" /> }))
vi.mock('./slides/Slide06IphoneStory', () => ({ default: (_p: object) => <div data-testid="slide-5" /> }))
vi.mock('./slides/Slide07Comparison', () => ({ default: (_p: object) => <div data-testid="slide-6" /> }))
vi.mock('./slides/Slide08Hints', () => ({ default: (_p: object) => <div data-testid="slide-7" /> }))
vi.mock('./slides/Slide09Test', () => ({ default: (_p: object) => <div data-testid="slide-8" /> }))
vi.mock('./slides/Slide10Go', () => ({ default: (_p: object) => <div data-testid="slide-9" /> }))
vi.mock('./slides/Slide11Quests', () => ({ default: (_p: object) => <div data-testid="slide-10" /> }))
vi.mock('./slides/Slide12Leaderboard', () => ({ default: (_p: object) => <div data-testid="slide-11" /> }))
vi.mock('./slides/Slide13Bonus', () => ({ default: (_p: object) => <div data-testid="slide-12" /> }))

describe('App navigation', () => {
  beforeEach(() => {
    render(<App />)
  })

  it('renders 13 dot indicators', () => {
    expect(screen.getAllByRole('button')).toHaveLength(13)
  })

  it('shows slide 1 / 13 initially', () => {
    expect(screen.getByText('1 / 13')).toBeInTheDocument()
  })

  it('ArrowRight advances to slide 2', () => {
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('2 / 13')).toBeInTheDocument()
  })

  it('ArrowLeft does not go below slide 1', () => {
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('1 / 13')).toBeInTheDocument()
  })

  it('does not exceed slide 13 on ArrowRight spam', () => {
    for (let i = 0; i < 20; i++) fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(screen.getByText('13 / 13')).toBeInTheDocument()
  })
})
