import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'parchment' | 'clean-light' | 'deep-dark'

const VALID_THEMES: Theme[] = ['parchment', 'clean-light', 'deep-dark']

function isValidTheme(value: unknown): value is Theme {
  return VALID_THEMES.includes(value as Theme)
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const themeMap: Record<Theme, string | null> = {
  'parchment': null,
  'clean-light': 'clean-light',
  'deep-dark': 'deep-dark',
}

function applyThemeToDOM(theme: Theme): void {
  const dataTheme = themeMap[theme]
  if (dataTheme) {
    document.documentElement.setAttribute('data-theme', dataTheme)
  } else {
    document.documentElement.removeAttribute('data-theme')
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'parchment',
      setTheme: (theme: Theme) => {
        if (!isValidTheme(theme)) {
          console.warn(`Invalid theme value: ${theme}`)
          return
        }
        set({ theme })
        applyThemeToDOM(theme)
      },
    }),
    {
      name: 'storyforge-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.theme && isValidTheme(state.theme)) {
          applyThemeToDOM(state.theme)
        }
      },
    }
  )
)
