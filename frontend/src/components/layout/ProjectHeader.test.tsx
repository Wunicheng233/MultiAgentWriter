import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectHeader } from './ProjectHeader'

// Mock the stores
vi.mock('../../store/useProjectStore', () => ({
  useProjectStore: vi.fn(),
}))

vi.mock('../../store/useLayoutStore', () => ({
  useLayoutStore: vi.fn(() => ({
    headerCollapsed: false,
    toggleHeader: vi.fn(),
  })),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

describe('ProjectHeader', () => {
  it('renders project name and status correctly', async () => {
    const { useProjectStore } = await import('../../store/useProjectStore')
    vi.mocked(useProjectStore).mockReturnValue({
      currentProjectName: '星际迷航',
      projectStatus: 'generating',
      progressPercent: 57,
      clearCurrentProject: vi.fn(),
    })

    render(<ProjectHeader />)
    expect(screen.getByText('星际迷航')).toBeInTheDocument()
    expect(screen.getByText('生成中')).toBeInTheDocument()
  })

  it('shows back to shelf button', async () => {
    const { useProjectStore } = await import('../../store/useProjectStore')
    vi.mocked(useProjectStore).mockReturnValue({
      currentProjectName: '测试项目',
      projectStatus: 'draft',
      progressPercent: 0,
      clearCurrentProject: vi.fn(),
    })

    render(<ProjectHeader />)
    expect(screen.getByText('书架')).toBeInTheDocument()
  })

  it('navigates back to shelf when back button is clicked', async () => {
    const mockNavigate = vi.fn()
    vi.doMock('react-router-dom', async () => ({
      ...await vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate,
    }))

    const { useProjectStore } = await import('../../store/useProjectStore')
    const mockClear = vi.fn()
    vi.mocked(useProjectStore).mockReturnValue({
      currentProjectName: '测试项目',
      projectStatus: 'draft',
      progressPercent: 0,
      clearCurrentProject: mockClear,
    })

    render(<ProjectHeader />)
    await fireEvent.click(screen.getByText('书架'))
    expect(mockClear).toHaveBeenCalled()
  })
})
