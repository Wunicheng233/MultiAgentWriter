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
    useLayoutStore.getState().toggleRightPanel()
    expect(useLayoutStore.getState().rightPanelOpen).toBe(false)
  })

  it('should toggle focus mode', () => {
    useLayoutStore.getState().toggleFocusMode()
    expect(useLayoutStore.getState().focusMode).toBe(true)
    useLayoutStore.getState().toggleFocusMode()
    expect(useLayoutStore.getState().focusMode).toBe(false)
  })

  it('should set right panel open state explicitly', () => {
    useLayoutStore.getState().setRightPanelOpen(true)
    expect(useLayoutStore.getState().rightPanelOpen).toBe(true)
    useLayoutStore.getState().setRightPanelOpen(false)
    expect(useLayoutStore.getState().rightPanelOpen).toBe(false)
  })

  it('should have default right panel width of 320px', () => {
    expect(useLayoutStore.getState().rightPanelWidth).toBe(320)
  })

  it('should set right panel width within valid range', () => {
    useLayoutStore.getState().setRightPanelWidth(360)
    expect(useLayoutStore.getState().rightPanelWidth).toBe(360)
  })

  it('should clamp right panel width to minimum of 240px', () => {
    useLayoutStore.getState().setRightPanelWidth(100)
    expect(useLayoutStore.getState().rightPanelWidth).toBe(240)
  })

  it('should clamp right panel width to maximum of 480px', () => {
    useLayoutStore.getState().setRightPanelWidth(600)
    expect(useLayoutStore.getState().rightPanelWidth).toBe(480)
  })
})
