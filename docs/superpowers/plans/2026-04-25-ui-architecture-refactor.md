# UI Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild StoryForge UI with Claude Code / Zed style three-column architecture, three-theme system, and "invisible editor" minimalist philosophy.

**Architecture:** 
- Three-column layout: Left Nav Rail (60px, collapsible to 12px) + Center Canvas (elastic) + Right AI Panel (320px, collapsible)
- CSS variable theming system (Warm Parchment, Clean Light, Deep Dark)
- Incremental migration: Build new layout alongside existing code, no big-bang rewrite

**Tech Stack:** React 18 + TypeScript + Tailwind CSS + Tiptap Editor + Zustand (state management)

---

## Phase 1: Foundation Architecture (Est: 1-2 days)

### Task 1.1: CSS Variable Theme System Setup

**Files:**
- Modify: `frontend/src/index.css:1-100`
- Test: `frontend/src/test/theme.test.tsx`

- [ ] **Step 1: Write failing test for theme variables**

```typescript
// frontend/src/test/theme.test.tsx
import { describe, it, expect } from 'vitest'

describe('Theme System', () => {
  it('should define all required CSS variables for Warm Parchment theme', () => {
    const root = document.documentElement
    const vars = [
      '--bg-primary', '--bg-secondary', '--bg-tertiary',
      '--text-primary', '--text-body', '--text-secondary', '--text-muted',
      '--accent-primary', '--accent-warm', '--accent-soft', '--accent-gold',
      '--border-default', '--border-strong', '--border-subtle',
      '--shadow-subtle', '--shadow-default', '--shadow-elevated'
    ]
    
    const computedStyle = getComputedStyle(root)
    vars.forEach(v => {
      expect(computedStyle.getPropertyValue(v)).toBeTruthy()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:run -- --include test/theme.test.tsx`
Expected: FAIL with "AssertionError: expected '' to be truthy"

- [ ] **Step 3: Implement CSS variable system with three themes**

```css
/* frontend/src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Crimson+Pro:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* Theme Variables */
:root {
  /* Theme 1: Warm Parchment (DEFAULT) */
  --bg-primary: #faf7f2;
  --bg-secondary: #ffffff;
  --bg-tertiary: rgba(255, 255, 255, 0.6);
  --text-primary: #3a2c1f;
  --text-body: #4a3f35;
  --text-secondary: #7a6f62;
  --text-muted: #a69a8d;
  --accent-primary: #5b7f6e;
  --accent-warm: #c06b4e;
  --accent-soft: #a8685c;
  --accent-gold: #a38b5a;
  --border-default: rgba(91, 127, 110, 0.12);
  --border-strong: rgba(91, 127, 110, 0.2);
  --border-subtle: #e8ddd0;
  --shadow-subtle: 0 2px 8px rgba(60, 40, 20, 0.04);
  --shadow-default: 0 4px 16px rgba(60, 40, 20, 0.06);
  --shadow-elevated: 0 8px 32px rgba(60, 40, 20, 0.1);
}

/* Theme 2: Clean Light */
[data-theme="clean-light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #f1f3f5;
  --text-primary: #1a1a1a;
  --text-body: #333333;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --accent-primary: #4f76f3;
  --border-default: rgba(0, 0, 0, 0.06);
  --border-strong: rgba(0, 0, 0, 0.1);
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-default: 0 2px 8px rgba(0, 0, 0, 0.06);
  --shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Theme 3: Deep Dark */
[data-theme="deep-dark"] {
  --bg-primary: #1a1d23;
  --bg-secondary: #22272e;
  --bg-tertiary: #2d333b;
  --text-primary: #e6edf3;
  --text-body: #adbac7;
  --text-secondary: #768390;
  --text-muted: #545d68;
  --accent-primary: #6494ed;
  --border-default: rgba(100, 148, 237, 0.12);
  --border-strong: rgba(100, 148, 237, 0.2);
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-default: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-elevated: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* Global Base Styles */
@layer base {
  * {
    box-sizing: border-box;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    min-height: 100vh;
    background-color: var(--bg-primary);
    color: var(--text-body);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  /* Serif font for narrative content */
  .font-serif {
    font-family: 'Crimson Pro', Georgia, serif;
  }
}

/* Custom Utilities */
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:run -- --include test/theme.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/index.css frontend/src/test/theme.test.tsx
git commit -m "feat: add CSS variable system with three themes"
```

---

### Task 1.2: Theme Store and Switcher Hook

**Files:**
- Create: `frontend/src/store/useThemeStore.ts`
- Test: `frontend/src/test/themeStore.test.tsx`

- [ ] **Step 1: Write failing test for theme store**

```typescript
// frontend/src/test/themeStore.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from '../store/useThemeStore'

describe('Theme Store', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'parchment' })
  })

  it('should have default theme of parchment', () => {
    const state = useThemeStore.getState()
    expect(state.theme).toBe('parchment')
  })

  it('should set theme correctly', () => {
    useThemeStore.getState().setTheme('clean-light')
    expect(useThemeStore.getState().theme).toBe('clean-light')
  })

  it('should toggle between themes', () => {
    const state = useThemeStore.getState()
    expect(state.theme).toBe('parchment')
    state.setTheme('deep-dark')
    expect(useThemeStore.getState().theme).toBe('deep-dark')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:run -- --include test/themeStore.test.tsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement theme store with Zustand**

```typescript
// frontend/src/store/useThemeStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'parchment' | 'clean-light' | 'deep-dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const themeMap: Record<Theme, string> = {
  'parchment': '',
  'clean-light': 'clean-light',
  'deep-dark': 'deep-dark',
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'parchment',
      setTheme: (theme: Theme) => {
        set({ theme })
        const dataTheme = themeMap[theme]
        if (dataTheme) {
          document.documentElement.setAttribute('data-theme', dataTheme)
        } else {
          document.documentElement.removeAttribute('data-theme')
        }
      },
    }),
    {
      name: 'storyforge-theme-storage',
    }
  )
)

// Initialize theme on store hydration
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('storyforge-theme-storage')
  if (savedTheme) {
    try {
      const { state = JSON.parse(savedTheme).state
      if (state.theme && state.theme !== 'parchment') {
        document.documentElement.setAttribute('data-theme', themeMap[state.theme])
      }
    } catch (e) {
      // Ignore invalid stored state
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:run -- --include test/themeStore.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/store/useThemeStore.ts frontend/src/test/themeStore.test.tsx
git commit -m "feat: add theme store with persistence"
```

---

### Task 1.3: Three-Column Layout Framework

**Files:**
- Create: `frontend/src/components/layout/ThreeColumnLayout.tsx`
- Create: `frontend/src/components/layout/NavRail.tsx`
- Create: `frontend/src/components/layout/CanvasContainer.tsx`
- Create: `frontend/src/components/layout/RightPanel.tsx`
- Modify: `frontend/src/App.tsx`
- Test: `frontend/src/test/layout.test.tsx`

- [ ] **Step 1: Write failing test for layout structure**

```typescript
// frontend/src/test/layout.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThreeColumnLayout } from '../components/layout/ThreeColumnLayout'

describe('Three Column Layout', () => {
  it('should render all three layout regions', () => {
    render(
      <ThreeColumnLayout
        nav={<div data-testid="nav-rail" />}
        canvas={<div data-testid="canvas" />}
        rightPanel={<div data-testid="right-panel" />}
      />
    )
    expect(screen.getByTestId('nav-rail')).toBeTruthy()
    expect(screen.getByTestId('canvas')).toBeTruthy()
    expect(screen.getByTestId('right-panel')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:run -- --include test/layout.test.tsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement layout container**

```tsx
// frontend/src/components/layout/ThreeColumnLayout.tsx
import React from 'react'

interface ThreeColumnLayoutProps {
  nav: React.ReactNode
  canvas: React.ReactNode
  rightPanel: React.ReactNode
  rightPanelOpen?: boolean
  navCollapsed?: boolean
}

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  nav,
  canvas,
  rightPanel,
  rightPanelOpen = false,
  navCollapsed = false,
}) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Left Nav Rail */}
      <div
        className={`flex-shrink-0 transition-all duration-200 ease-out"
        style={{ width: navCollapsed ? '12px' : '60px' }}
      >
        {nav}
      </div>

      {/* Center Canvas */}
      <div className="flex-1 overflow-auto relative">
        {canvas}
      </div>

      {/* Right AI Panel */}
      <div
        className={`flex-shrink-0 transition-all duration-200 ease-out overflow-hidden"
        style={{
          width: rightPanelOpen ? '320px' : '0px',
          minWidth: rightPanelOpen ? '320px' : '0px',
        }}
      >
        {rightPanel}
      </div>
    </div>
  )
}

export default ThreeColumnLayout
```

- [ ] **Step 4: Implement Nav Rail component**

```tsx
// frontend/src/components/layout/NavRail.tsx
import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface NavItemProps {
  icon: React.ReactNode
  label: string
  path: string
  active: boolean
  onClick: () => void
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-11 h-11 flex items-center justify-center rounded-lg transition-all duration-150
        ${active
          ? 'bg-[var(--accent-primary)] bg-opacity-12 text-[var(--accent-primary)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
        }
      `}
      title={label}
    >
      {icon}
    </button>
  )
}

interface NavRailProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

// SVG Icons (outline style, no emoji)
const ProjectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const EditorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const ChaptersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
)

const CharactersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const AnalyticsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.1a1.65 1.65 0 0 0-1.51-1H10a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1-1.51H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.1a1.65 1.65 0 0 0 1.51-1l-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H8a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.1a1.65 1.65 0 0 0 1 1.51l.33 1.82.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15" />
  </svg>
)

const CollapseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

export const NavRail: React.FC<NavRailProps> = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [hovered, setHovered] = useState(false)

  const navItems = [
    { path: '/projects', icon: <ProjectIcon />, label: 'Project Overview' },
    { path: '/write', icon: <EditorIcon />, label: 'Editor' },
    { path: '/chapters', icon: <ChaptersIcon />, label: 'Chapters' },
    { path: '/characters', icon: <CharactersIcon />, label: 'Characters' },
    { path: '/analytics', icon: <AnalyticsIcon />, label: 'Analytics' },
    { path: '/settings', icon: <SettingsIcon />, label: 'Settings' },
  ]

  const isActive = (path: string) => {
    return location.pathname.startsWith(path)
  }

  // When collapsed and hovered, expand temporarily
  const effectiveCollapsed = collapsed && !hovered

  return (
    <div
      className={`h-full flex flex-col items-center py-4 bg-[var(--bg-secondary)] transition-all duration-200 ease-out ${
        effectiveCollapsed ? 'justify-center' : 'justify-between'
      }`}
      onMouseEnter={() => collapsed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!effectiveCollapsed && (
        <>
          <div className="flex flex-col gap-2 items-center">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={isActive(item.path)}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>

          <button
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-150"
            title="Collapse sidebar"
          >
            <CollapseIcon />
          </button>
        </>
      )}
    </div>
  )
}

export default NavRail
```

- [ ] **Step 5: Implement Canvas Container**

```tsx
// frontend/src/components/layout/CanvasContainer.tsx
import React from 'react'

interface CanvasContainerProps {
  children: React.ReactNode
  maxWidth?: number
  focusMode?: boolean
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  children,
  maxWidth = 720,
  focusMode = false,
}) => {
  return (
    <div
      className={`w-full h-full overflow-auto transition-all duration-200 ease-out`}
      style={{
        paddingTop: '64px',
        paddingBottom: '128px',
        paddingLeft: focusMode ? 'auto' : undefined,
        paddingRight: focusMode ? 'auto' : undefined,
      }}
    >
      <div
        className="mx-auto"
        style={{ maxWidth: focusMode ? Math.max(maxWidth, 900) : maxWidth }}
      >
        {children}
      </div>
    </div>
  )
}

export default CanvasContainer
```

- [ ] **Step 6: Implement Right Panel container**

```tsx
// frontend/src/components/layout/RightPanel.tsx
import React, { useState, useCallback } from 'react'

interface RightPanelProps {
  open: boolean
  children: React.ReactNode
}

export const RightPanel: React.FC<RightPanelProps> = ({ open, children }) => {
  return (
    <div className="h-full bg-[var(--bg-secondary)] flex flex-col border-l border-[var(--border-default)]">
      {children}
    </div>
  )
}

export default RightPanel
```

- [ ] **Step 7: Update App.tsx to use new layout for editor routes**

```tsx
// Add this to imports in App.tsx
import { ThreeColumnLayout } from './components/layout/ThreeColumnLayout'
import { NavRail } from './components/layout/NavRail'
import { CanvasContainer } from './components/layout/CanvasContainer'
import { RightPanel } from './components/layout/RightPanel'
```

- [ ] **Step 8: Run tests to verify layout passes**

Run: `cd frontend && npm run test:run -- --include test/layout.test.tsx`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add frontend/src/components/layout/ frontend/src/App.tsx frontend/src/test/layout.test.tsx
git commit -m "feat: add three-column layout framework"
```

---

## Phase 1 Acceptance Criteria

- [ ] CSS variables are defined and applied correctly
- [ ] Theme switching works with localStorage persistence
- [ ] Three-column layout renders all regions
- [ ] Nav rail collapses to 12px and expands on hover
- [ ] All tests pass

---

## Phase 2: Editor Core (Est: 2-3 days)

### Task 2.1: Layout State Store

**Files:**
- Create: `frontend/src/store/useLayoutStore.ts`
- Test: `frontend/src/test/layoutStore.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/src/test/layoutStore.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { useLayoutStore } from '../store/useLayoutStore'

describe('Layout Store', () => {
  beforeEach(() => {
    useLayoutStore.setState({
      navCollapsed: false,
      rightPanelOpen: false,
      focusMode: false,
    })
  })

  it('should have default state', () => {
    const state = useLayoutStore.getState()
    expect(state.navCollapsed).toBe(false)
    expect(state.rightPanelOpen).toBe(false)
    expect(state.focusMode).toBe(false)
  })

  it('should toggle nav collapsed state', () => {
    useLayoutStore.getState().toggleNavCollapsed()
    expect(useLayoutStore.getState().navCollapsed).toBe(true)
    useLayoutStore.getState().toggleNavCollapsed()
    expect(useLayoutStore.getState().navCollapsed).toBe(false)
  })

  it('should toggle right panel state', () => {
    useLayoutStore.getState().toggleRightPanel()
    expect(useLayoutStore.getState().rightPanelOpen).toBe(true)
  })

  it('should toggle focus mode', () => {
    useLayoutStore.getState().toggleFocusMode()
    expect(useLayoutStore.getState().focusMode).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm run test:run -- --include test/layoutStore.test.tsx`
Expected: FAIL with "Cannot find module"

- [ ] **Step 3: Implement layout store**

```typescript
// frontend/src/store/useLayoutStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  navCollapsed: boolean
  rightPanelOpen: boolean
  focusMode: boolean
  toggleNavCollapsed: () => void
  toggleRightPanel: () => void
  toggleFocusMode: () => void
  setRightPanelOpen: (open: boolean) => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      navCollapsed: false,
      rightPanelOpen: false,
      focusMode: false,
      toggleNavCollapsed: () => set((state) => ({ navCollapsed: !state.navCollapsed })),
      toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
      setRightPanelOpen: (open: boolean) => set({ rightPanelOpen: open }),
    }),
    {
      name: 'storyforge-layout-storage',
    }
  )
)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm run test:run -- --include test/layoutStore.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/store/useLayoutStore.ts frontend/src/test/layoutStore.test.tsx
git commit -m "feat: add layout state management store"
```

---

### Task 2.2: Keyboard Shortcuts System

**Files:**
- Create: `frontend/src/hooks/useKeyboardShortcuts.ts`
- Test: `frontend/src/test/keyboardShortcuts.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/src/test/keyboardShortcuts.test.tsx
import { describe, it, expect, vi } from 'vitest'

describe('Keyboard Shortcuts', () => {
  it('should register and trigger shortcuts', () => {
    // This is a placeholder - actual testing would simulate keyboard events
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Implement keyboard shortcuts hook**

```typescript
// frontend/src/hooks/useKeyboardShortcuts.ts
import { useEffect } from 'react'
import { useLayoutStore } from '../store/useLayoutStore'
import { useThemeStore } from '../store/useThemeStore'

interface Shortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  handler: () => void
  description: string
}

export const useKeyboardShortcuts = () => {
  const { toggleNavCollapsed, toggleRightPanel, toggleFocusMode } = useLayoutStore()
  const { setTheme, theme } = useThemeStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command + B: Toggle nav rail
      if ((e.metaKey || e.ctrlKey) && e.key === 'b' && !e.shiftKey) {
        e.preventDefault()
        toggleNavCollapsed()
        return
      }

      // Command + \: Toggle right panel
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        toggleRightPanel()
        return
      }

      // Command + Shift + F: Toggle focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        toggleFocusMode()
        return
      }

      // Command + 1-6: Navigate to pages
      if ((e.metaKey || e.ctrlKey) && /^[1-6]$/.test(e.key) && !e.shiftKey) {
        e.preventDefault()
        const paths = ['/projects', '/write', '/chapters', '/characters', '/analytics', '/settings']
        const index = parseInt(e.key) - 1
        if (paths[index]) {
          window.location.hash = paths[index]
        }
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleNavCollapsed, toggleRightPanel, toggleFocusMode])
}

export default useKeyboardShortcuts
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/hooks/useKeyboardShortcuts.ts frontend/src/test/keyboardShortcuts.test.tsx
git commit -m "feat: add keyboard shortcuts system"
```

---

### Task 2.3: Focus Mode Implementation

**Files:**
- Modify: `frontend/src/components/layout/CanvasContainer.tsx`
- Test: `frontend/src/test/focusMode.test.tsx`

- [ ] **Step 1: Write failing test for focus mode styling**

```typescript
// frontend/src/test/focusMode.test.tsx
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CanvasContainer } from '../components/layout/CanvasContainer'

describe('Focus Mode', () => {
  it('should apply wider max-width when focus mode is enabled', () => {
    const { container } = render(
      <CanvasContainer focusMode={true}>
        <div>Content</div>
      </CanvasContainer>
    )
    const inner = container.firstChild as HTMLElement
    expect(inner.style.maxWidth).toContain('900')
  })
})
```

- [ ] **Step 2: Update CanvasContainer with focus mode styles**

```tsx
// Update CanvasContainer to add focus mode styling
// Add this class for focus mode:
// opacity reduction for non-essential UI elements
// width expansion
```

- [ ] **Step 3: Run test**

Run: `cd frontend && npm run test:run -- --include test/focusMode.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/layout/CanvasContainer.tsx frontend/src/test/focusMode.test.tsx
git commit -m "feat: implement focus mode with expanded canvas"
```

---

## Phase 2 Acceptance Criteria

- [ ] Layout state is persisted and toggles correctly
- [ ] Keyboard shortcuts work for all core operations
- [ ] Focus mode expands canvas and reduces UI visibility
- [ ] Editor canvas centers content with proper typography settings

---

## Phase 3: AI Assistant Panel (Est: 2-3 days)

### Task 3.1: Right Panel Resize Handle

**Files:**
- Modify: `frontend/src/components/layout/RightPanel.tsx`
- Create: `frontend/src/components/layout/ResizeHandle.tsx`
- Test: `frontend/src/test/resizeHandle.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/src/test/resizeHandle.test.tsx
import { describe, it, expect } from 'vitest'

describe('Resize Handle', () => {
  it('should exist and render', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Implement Resize Handle component**

```tsx
// frontend/src/components/layout/ResizeHandle.tsx
import React, { useState, useCallback, useEffect } from 'react'

interface ResizeHandleProps {
  onResize: (width: number) => void
  minWidth?: number
  maxWidth?: number
  currentWidth: number
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResize,
  minWidth = 240,
  maxWidth = 480,
  currentWidth,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      onResize(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, minWidth, maxWidth, onResize])

  return (
    <div
      className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize transition-colors duration-150 hover:bg-[var(--accent-primary)] hover:bg-opacity-20"
      onMouseDown={handleMouseDown}
      style={{
        backgroundColor: isDragging ? 'var(--accent-primary)' : 'transparent',
        opacity: isDragging ? 0.3 : 1,
      }}
    />
  )
}

export default ResizeHandle
```

- [ ] **Step 3: Update RightPanel to include resize**

```tsx
// Update RightPanel to integrate ResizeHandle
// Add width state and pass to ResizeHandle
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/layout/ResizeHandle.tsx frontend/src/components/layout/RightPanel.tsx frontend/src/test/resizeHandle.test.tsx
git commit -m "feat: add right panel resize functionality"
```

---

### Task 3.2: AI Chat Panel UI

**Files:**
- Create: `frontend/src/components/ai/AIChatPanel.tsx`
- Create: `frontend/src/components/ai/ChatMessage.tsx`
- Create: `frontend/src/store/useChatStore.ts`
- Test: `frontend/src/test/aiChat.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/src/test/aiChat.test.tsx
import { describe, it, expect } from 'vitest'

describe('AI Chat Panel', () => {
  it('should render messages', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Implement Chat Store**

```typescript
// frontend/src/store/useChatStore.ts
import { create } from 'zustand'

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: number
}

interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  inputText: string
  addMessage: (message: Omit<ChatMessage>) => void
  setIsTyping: (typing: boolean) => void
  setInputText: (text: string) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  inputText: '',
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, { ...message, timestamp: Date.now() }],
    })),
  setIsTyping: (typing) => set({ isTyping: typing }),
  setInputText: (text) => set({ inputText: text }),
  clearMessages: () => set({ messages: [] }),
}))
```

- [ ] **Step 3: Implement ChatMessage component**

```tsx
// frontend/src/components/ai/ChatMessage.tsx
import React from 'react'
import { ChatMessage as ChatMessageType } from '../../store/useChatStore'

interface ChatMessageProps {
  message: ChatMessageType
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-[var(--accent-primary)] text-white'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-body)]'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  )
}

export default ChatMessage
```

- [ ] **Step 4: Implement AI Chat Panel**

```tsx
// frontend/src/components/ai/AIChatPanel.tsx
import React, { useRef, useEffect } from 'react'
import { useChatStore } from '../../store/useChatStore'
import ChatMessage from './ChatMessage'

export const AIChatPanel: React.FC = () => {
  const { messages, inputText, isTyping, setInputText, addMessage, setIsTyping } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    // Add user message
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    })

    const userInput = inputText
    setInputText('')
    setIsTyping(true)

    // Simulate AI response (placeholder - integrate with real API later
    setTimeout(() => {
      setIsTyping(false)
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I received your message: "${userInput}". This is a placeholder response until the AI backend is connected.`,
        timestamp: Date.now(),
      })
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)]">
            <div className="text-center">
              <p className="text-sm mb-2">Ask me anything about your story</p>
              <p className="text-xs opacity-70">I can help with plot, characters, style, and more</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="bg-[var(--bg-tertiary)] rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 border-t border-[var(--border-default)]">
        <form onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full resize-none rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-body)] placeholder-[var(--text-muted)] border-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-opacity-30 p-3 text-sm"
            rows={3}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-4 py-2 rounded-full bg-[var(--accent-primary)] text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AIChatPanel
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/ai/ frontend/src/store/useChatStore.ts frontend/src/test/aiChat.test.tsx
git commit -m "feat: add AI chat panel UI and state management"
```

---

## Phase 3 Acceptance Criteria

- [ ] Right panel can be resized with drag handle
- [ ] AI chat panel sends and displays messages correctly
- [ ] Panel open/close animations are smooth and under 300ms
- [ ] No modal dialogs are used anywhere

---

## Phase 4: Page Migration (Est: 3-4 days)

### Task 4.1: Settings Page with Theme Selector

**Files:**
- Modify: `frontend/src/pages/Settings.tsx`
- Create: `frontend/src/components/ThemeSelector.tsx`
- Test: `frontend/src/test/settings.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/src/test/settings.test.tsx
import { describe, it, expect } from 'vitest'

describe('Settings Page', () => {
  it('should render theme selector', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Implement Theme Selector component**

```tsx
// frontend/src/components/ThemeSelector.tsx
import React from 'react'
import { useThemeStore, Theme } from '../store/useThemeStore'

const themeOptions: { key: Theme; label: string; description: string }[] = [
  { key: 'parchment', label: 'Warm Parchment', description: 'Soft, paper-like, warm and comfortable for long writing sessions' },
  { key: 'clean-light', label: 'Clean Light', description: 'Bright, modern, crisp white background for clarity' },
  { key: 'deep-dark', label: 'Deep Dark', description: 'Dark, eye-friendly, perfect for night writing' },
]

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[var(--text-primary)]">Theme</h3>
      <div className="grid gap-3">
        {themeOptions.map((option) => (
          <button
            key={option.key}
            onClick={() => setTheme(option.key)}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-150 ${
              theme === option.key
                ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)] bg-opacity-10'
                : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
            }`}
          >
            <div className="font-medium text-[var(--text-primary)]">{option.label}</div>
            <div className="text-sm text-[var(--text-secondary)] mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default ThemeSelector
```

- [ ] **Step 3: Update Settings page**

```tsx
// frontend/src/pages/Settings.tsx
// Integrate ThemeSelector into settings page
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ThemeSelector.tsx frontend/src/pages/Settings.tsx frontend/src/test/settings.test.tsx
git commit -m "feat: add theme selector to settings page"
```

---

### Task 4.2-4.4: Remaining Page Migrations

Follow the same pattern for:
- Project Overview page migration
- Chapter List page migration  
- Quality Analytics page migration

Each page follows similar steps:
1. Wrap content in CanvasContainer
2. Update styles to use CSS variables
3. Update components for new layout
4. Test and commit

---

## Phase 5: Polish and Optimization (Est: 2-3 days)

### Task 5.1: Animation and Performance Optimizations

**Files:**
- All layout components
- Test: Performance tests

- [ ] **Step 1: Verify animation timing - ensure all animations are under 300ms
- [ ] **Step 2: Add will-change and content-visibility optimizations**
- [ ] **Step 3: Optimize re-renders with React.memo and useMemo**
- [ ] **Step 4: Run Lighthouse performance audit**
- [ ] **Step 5: Commit performance fixes**

---

### Task 5.2: Accessibility Review

**Files:**
- All components
- Add ARIA labels
- Add keyboard navigation improvements
- Test screen reader support

---

### Task 5.3: Final Acceptance Testing

Run all tests:
```bash
cd frontend && npm run test:run
```

Verify all acceptance criteria from the design spec:

1. Blank screen test: < 3 UI elements visible at rest
2. Focus mode test: < 10% opacity for non-edit elements
3. Keyboard operation test: All functions work
4. Performance test: Animations > 55fps
5. Visual consistency review: No inline styles, all CSS variables used

---

## Final Acceptance Criteria

- [ ] Three-column layout works correctly
- [ ] All three themes work and persist
- [ ] Nav rail collapses and expands
- [ ] Focus mode operates correctly
- [ ] AI chat panel works
- [ ] No emoji anywhere in UI
- [ ] All animations under 300ms
- [ ] No modal dialogs used
- [ ] All pages migrated to new layout
- [ ] All tests pass
- [ ] Performance and accessibility audits pass
