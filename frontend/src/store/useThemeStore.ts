import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'parchment' | 'clean-light' | 'deep-dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const themeMap: Record<Theme, string | null> = {
  'parchment': null,
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

// Initialize theme from localStorage on hydration
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('storyforge-theme-storage')
  if (savedTheme) {
    try {
      const parsed = JSON.parse(savedTheme)
      if (parsed.state && parsed.state.theme && parsed.state.theme !== 'parchment') {
        const dataTheme = themeMap[parsed.state.theme]
        if (dataTheme) {
          document.documentElement.setAttribute('data-theme', dataTheme)
        }
      }
    } catch (e) {
      // Ignore invalid stored state
    }
  }
}
