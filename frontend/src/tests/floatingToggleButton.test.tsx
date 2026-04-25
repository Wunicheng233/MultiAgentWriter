import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FloatingToggleButton } from '../components/FloatingToggleButton'
import { useLayoutStore } from '../store/useLayoutStore'

describe('Floating Toggle Button', () => {
  beforeEach(() => {
    // Reset layout store before each test
    useLayoutStore.setState({
      navCollapsed: false,
      rightPanelOpen: false,
      rightPanelWidth: 320,
      focusMode: false,
    })
  })

  it('should render when right panel is closed', () => {
    render(<FloatingToggleButton />)

    expect(screen.getByTestId('floating-toggle-button')).toBeTruthy()
  })

  it('should be hidden when right panel is open', () => {
    useLayoutStore.setState({ rightPanelOpen: true })
    render(<FloatingToggleButton />)

    const button = screen.getByTestId('floating-toggle-button')
    expect(button.className).toContain('opacity-0')
    expect(button.className).toContain('pointer-events-none')
  })

  it('should open right panel when clicked', () => {
    render(<FloatingToggleButton />)

    const button = screen.getByTestId('floating-toggle-button')
    fireEvent.click(button)

    expect(useLayoutStore.getState().rightPanelOpen).toBe(true)
  })

  it('should use accent primary for background', () => {
    render(<FloatingToggleButton />)

    const button = screen.getByTestId('floating-toggle-button')
    expect(button.className).toContain('bg-[var(--accent-primary)]')
  })

  it('should have chat icon SVG inside', () => {
    render(<FloatingToggleButton />)

    const button = screen.getByTestId('floating-toggle-button')
    const svg = button.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('should have smooth transition under 300ms', () => {
    render(<FloatingToggleButton />)

    const button = screen.getByTestId('floating-toggle-button')
    expect(button.className).toContain('duration-200')
  })

  it('should be positioned in bottom right corner', () => {
    render(<FloatingToggleButton />)

    const button = screen.getByTestId('floating-toggle-button')
    expect(button.className).toContain('bottom-6')
    expect(button.className).toContain('right-6')
  })
})
