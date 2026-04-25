import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeSelector } from '../components/ThemeSelector'
import { useThemeStore } from '../store/useThemeStore'

describe('Theme Selector', () => {
  beforeEach(() => {
    // Reset theme store before each test
    useThemeStore.setState({ theme: 'parchment' })
  })

  it('should render all three theme options', () => {
    render(<ThemeSelector />)

    expect(screen.getByText('Warm Parchment')).toBeTruthy()
    expect(screen.getByText('Clean Light')).toBeTruthy()
    expect(screen.getByText('Deep Dark')).toBeTruthy()
  })

  it('should show theme descriptions for each option', () => {
    render(<ThemeSelector />)

    expect(screen.getByText(/Soft, paper-like/)).toBeTruthy()
    expect(screen.getByText(/Bright, modern/)).toBeTruthy()
    expect(screen.getByText(/Dark, eye-friendly/)).toBeTruthy()
  })

  it('should highlight selected theme with accent border', () => {
    render(<ThemeSelector />)

    const parchmentButton = screen.getByText('Warm Parchment').closest('button')
    expect(parchmentButton?.className).toContain('border-[var(--accent-primary)]')
  })

  it('should change theme when clicking an option', () => {
    render(<ThemeSelector />)

    const cleanLightButton = screen.getByText('Clean Light').closest('button')
    fireEvent.click(cleanLightButton!)

    expect(useThemeStore.getState().theme).toBe('clean-light')
  })

  it('should update selected state when theme changes', () => {
    render(<ThemeSelector />)

    // Initially parchment is selected
    const parchmentButton = screen.getByText('Warm Parchment').closest('button')
    expect(parchmentButton?.className).toContain('border-[var(--accent-primary)]')

    // Click Deep Dark
    const deepDarkButton = screen.getByText('Deep Dark').closest('button')
    fireEvent.click(deepDarkButton!)

    // Now Deep Dark should be selected
    expect(deepDarkButton?.className).toContain('border-[var(--accent-primary)]')
  })

  it('should have data-testid for each theme card', () => {
    render(<ThemeSelector />)

    expect(screen.getByTestId('theme-parchment')).toBeTruthy()
    expect(screen.getByTestId('theme-clean-light')).toBeTruthy()
    expect(screen.getByTestId('theme-deep-dark')).toBeTruthy()
  })
})

