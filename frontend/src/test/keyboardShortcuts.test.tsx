import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useLayoutStore } from '../store/useLayoutStore'

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
)

describe('Keyboard Shortcuts', () => {
  beforeEach(() => {
    useLayoutStore.setState({
      navCollapsed: false,
      rightPanelOpen: false,
      focusMode: false,
    })
  })

  it('should toggle nav collapsed on Command+B', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper: RouterWrapper })

    const event = new KeyboardEvent('keydown', { metaKey: true, key: 'b' })
    window.dispatchEvent(event)

    expect(useLayoutStore.getState().navCollapsed).toBe(true)
  })

  it('should toggle right panel on Command+\\', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper: RouterWrapper })

    const event = new KeyboardEvent('keydown', { metaKey: true, key: '\\' })
    window.dispatchEvent(event)

    expect(useLayoutStore.getState().rightPanelOpen).toBe(true)
  })

  it('should toggle focus mode on Command+Shift+F', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper: RouterWrapper })

    const event = new KeyboardEvent('keydown', { metaKey: true, shiftKey: true, key: 'f' })
    window.dispatchEvent(event)

    expect(useLayoutStore.getState().focusMode).toBe(true)
  })

  it('should work with Ctrl instead of Command', () => {
    renderHook(() => useKeyboardShortcuts(), { wrapper: RouterWrapper })

    const event = new KeyboardEvent('keydown', { ctrlKey: true, key: 'b' })
    window.dispatchEvent(event)

    expect(useLayoutStore.getState().navCollapsed).toBe(true)
  })

  it('should clean up event listener on unmount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useKeyboardShortcuts(), { wrapper: RouterWrapper })

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })
})
