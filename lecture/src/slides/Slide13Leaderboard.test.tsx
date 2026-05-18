import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import Slide13Leaderboard from './Slide13Leaderboard'

const mockStats = {
  totalUsers: 2,
  completedUsers: 1,
  totalQuestAccesses: 6,
  users: [
    {
      nickname: '홍길동',
      walletAddress: '0x1234…abcd',
      purchasedSteps: [1, 2, 3],
      isCompleted: false,
      registeredAt: new Date().toISOString(),
    },
    {
      nickname: '이영희',
      walletAddress: '0x5678…efgh',
      purchasedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      isCompleted: true,
      registeredAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    },
  ],
}

describe('Slide13Leaderboard', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockStats),
    } as unknown as Response)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('로딩 중 텍스트를 초기에 표시한다', () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}))
    render(<Slide13Leaderboard animKey={0} />)
    expect(screen.getByText(/로딩 중/)).toBeInTheDocument()
  })

  it('fetch 후 참가자 닉네임을 렌더링한다', async () => {
    render(<Slide13Leaderboard animKey={0} />)
    await waitFor(() => expect(screen.getByText('홍길동')).toBeInTheDocument())
    expect(screen.getByText('이영희')).toBeInTheDocument()
  })

  it('헤더에 통계를 표시한다', async () => {
    render(<Slide13Leaderboard animKey={0} />)
    await waitFor(() => expect(screen.getByText('참가자')).toBeInTheDocument())
  })

  it('Q1~Q10 행 레이블을 렌더링한다', async () => {
    render(<Slide13Leaderboard animKey={0} />)
    await waitFor(() => expect(screen.getByText('Q1')).toBeInTheDocument())
    expect(screen.getByText('Q10')).toBeInTheDocument()
  })
})
