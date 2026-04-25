import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { expect, describe, test, vi } from 'vitest'
import React from 'react'
import { ToastContext } from '../components/toastContext'

// Mock useAuthStore
vi.mock('../store/useAuthStore', () => ({
  useAuthStore: () => ({ user: { id: 1, username: 'test' } }),
}))

// Mock Layout
vi.mock('../components/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('../utils/endpoints', () => ({
  getProject: vi.fn().mockResolvedValue({
    id: 1,
    user_id: 1,
    name: 'Test Project',
    description: 'Test',
    content_type: 'full_novel',
    status: 'draft',
    overall_quality_score: 0,
    created_at: '2026-04-25T00:00:00',
    updated_at: '2026-04-25T00:00:00',
    config: {},
  }),
  getProjectWorkflowRuns: vi.fn().mockResolvedValue({ total: 0, items: [] }),
  getProjectArtifacts: vi.fn().mockResolvedValue({ total: 0, items: [] }),
  listCollaborators: vi.fn().mockResolvedValue({ collaborators: [] }),
  getProjectTokenStats: vi.fn().mockResolvedValue({ total_tokens: 0, prompt_tokens: 0, completion_tokens: 0, total_cost: 0 }),
}))

// Mock SkillSelector since it has its own test
vi.mock('../components/SkillSelector', () => ({
  default: () => <div data-testid="skill-selector" />,
}))

import ProjectOverview from './ProjectOverview'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ToastContext.Provider value={{ showToast: vi.fn() }}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/projects/1']}>
          {ui}
        </MemoryRouter>
      </QueryClientProvider>
    </ToastContext.Provider>
  )
}

describe('ProjectOverview - UI 优化', () => {
  test('标签页按钮应该有 transition 过渡类名', async () => {
    renderWithProviders(<ProjectOverview />)
    // 等待所有标签页渲染完成
    const tabs = await screen.findAllByText(/工作流|创作配置|质量交付/)
    tabs.forEach(tab => {
      const button = tab.closest('button')
      if (button) {
        expect(button).toHaveClass('transition-all')
      }
    })
    expect(tabs.length).toBeGreaterThan(0)
  })

  test.skip('Flow Story 描述应该精简，不应该有长段落说明', async () => {
    renderWithProviders(<ProjectOverview />)
    // 不应该有大段描述文字
    const longDescription = screen.queryByText(/从创意到作品交付的关键路径收成一张总览/)
    expect(longDescription).not.toBeInTheDocument()
  })

  test.skip('卡片应该有足够的内边距保证呼吸感', async () => {
    renderWithProviders(<ProjectOverview />)
    // 顶部卡片应该有足够的 padding
    const cards = document.querySelectorAll('.paper-card')
    cards.forEach(card => {
      // 至少应该有 p-8 (32px) 或更大的内边距
      const hasPadding = /\bp-(\d+)\b/.test(card.className) ||
                       /\bpx-(\d+)\b/.test(card.className)
      expect(hasPadding).toBe(true)
    })
  })
})
