import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Outlet } from 'react-router-dom'

// Mock the auth store
vi.mock('./store/useAuthStore', () => ({
  useAuthStore: () => ({
    initializeAuth: vi.fn(),
    isAuthenticated: true,
    user: { id: 1, email: 'test@example.com' }
  })
}))

// Mock lazy components
vi.mock('./pages/ProjectOverview', () => ({
  default: () => <div data-testid="project-overview">Project Overview</div>
}))

vi.mock('./pages/ChapterList', () => ({
  default: () => <div data-testid="chapter-list">Chapter List</div>
}))

vi.mock('./pages/Editor', () => ({
  default: () => <div data-testid="editor">Editor</div>
}))

vi.mock('./pages/QualityDashboard', () => ({
  default: () => <div data-testid="quality-dashboard">Quality Dashboard</div>
}))

vi.mock('./pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard">Dashboard</div>
}))

vi.mock('./pages/Login', () => ({
  default: () => <div data-testid="login">Login</div>
}))

vi.mock('./pages/Register', () => ({
  default: () => <div data-testid="register">Register</div>
}))

vi.mock('./pages/CreateProject', () => ({
  default: () => <div data-testid="create-project">Create Project</div>
}))

vi.mock('./pages/WorkflowRunDetail', () => ({
  default: () => <div data-testid="workflow-run-detail">Workflow Run Detail</div>
}))

vi.mock('./pages/ArtifactDetail', () => ({
  default: () => <div data-testid="artifact-detail">Artifact Detail</div>
}))

vi.mock('./pages/ShareView', () => ({
  default: () => <div data-testid="share-view">Share View</div>
}))

vi.mock('./pages/Settings', () => ({
  default: () => <div data-testid="settings">Settings</div>
}))

vi.mock('./pages/ComponentShowcase', () => ({
  default: () => <div data-testid="component-showcase">Component Showcase</div>
}))

vi.mock('./components/Reader/index', () => ({
  default: () => <div data-testid="reader">Reader</div>
}))

vi.mock('./components/layout/AppLayout', () => ({
  default: () => <div data-testid="app-layout"><Outlet /></div>
}))

vi.mock('./components/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

vi.mock('./components/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

// Now import AppRoutes after all mocks
import { AppRoutes } from './App'

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Project Route Redirects', () => {
    it('redirects /projects/:id to /projects/:id/overview', async () => {
      render(
        <MemoryRouter initialEntries={['/projects/123']}>
          <AppRoutes />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('project-overview')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('redirects /projects/:id/write/:chapterIndex to /projects/:id/editor/:chapterIndex', async () => {
      render(
        <MemoryRouter initialEntries={['/projects/123/write/0']}>
          <AppRoutes />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('editor')).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })

  describe('Project Nested Routes', () => {
    it('renders ProjectOverview at /projects/:id/overview', async () => {
      render(
        <MemoryRouter initialEntries={['/projects/123/overview']}>
          <AppRoutes />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('project-overview')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('renders ChapterList at /projects/:id/chapters', async () => {
      render(
        <MemoryRouter initialEntries={['/projects/123/chapters']}>
          <AppRoutes />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('chapter-list')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('renders Editor at /projects/:id/editor/:chapterIndex', async () => {
      render(
        <MemoryRouter initialEntries={['/projects/123/editor/1']}>
          <AppRoutes />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('editor')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('renders QualityDashboard at /projects/:id/analytics', async () => {
      render(
        <MemoryRouter initialEntries={['/projects/123/analytics']}>
          <AppRoutes />
        </MemoryRouter>
      )

      await waitFor(() => {
        expect(screen.getByTestId('quality-dashboard')).toBeInTheDocument()
      }, { timeout: 2000 })
    })
  })
})
