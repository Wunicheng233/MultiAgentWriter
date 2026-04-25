import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LayoutState {
  navCollapsed: boolean
  rightPanelOpen: boolean
  rightPanelWidth: number
  focusMode: boolean
  toggleNavCollapsed: () => void
  toggleRightPanel: () => void
  toggleFocusMode: () => void
  setRightPanelOpen: (open: boolean) => void
  setRightPanelWidth: (width: number) => void
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      navCollapsed: false,
      rightPanelOpen: false,
      rightPanelWidth: 320,
      focusMode: false,
      toggleNavCollapsed: () => set((state) => ({ navCollapsed: !state.navCollapsed })),
      toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
      toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
      setRightPanelOpen: (open: boolean) => set({ rightPanelOpen: open }),
      setRightPanelWidth: (width: number) => set({ rightPanelWidth: Math.max(240, Math.min(480, width)) }),
    }),
    {
      name: 'storyforge-layout-storage',
    }
  )
)
