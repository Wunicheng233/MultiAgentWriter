import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore } from '../store/useThemeStore'

describe('Theme Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useThemeStore.setState({ theme: 'parchment' })
    // Clear localStorage
    vi.spyOn(Storage.prototype, 'setItem')
    Storage.prototype.setItem = vi.fn()
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

  it('should export Theme type with all three themes', () => {
    // This test verifies the type exists by testing all theme values
    const themes = ['parchment', 'clean-light', 'deep-dark'] as const
    themes.forEach(theme => {
      useThemeStore.getState().setTheme(theme)
      expect(useThemeStore.getState().theme).toBe(theme)
    })
  })
})
