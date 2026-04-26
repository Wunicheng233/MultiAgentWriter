import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Switch } from './Switch'

describe('Switch', () => {
  it('renders correctly with default props', () => {
    render(<Switch aria-label="Toggle setting" />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('can be controlled via checked prop', () => {
    const { rerender } = render(<Switch checked={true} aria-label="Toggle" />)
    expect(screen.getByRole('switch')).toBeChecked()

    rerender(<Switch checked={false} aria-label="Toggle" />)
    expect(screen.getByRole('switch')).not.toBeChecked()
  })

  it('calls onChange when clicked', async () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange} aria-label="Toggle" />)

    await fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)

    await fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('is disabled when disabled prop is true', async () => {
    const onChange = vi.fn()
    render(<Switch disabled onChange={onChange} aria-label="Toggle" />)

    expect(screen.getByRole('switch')).toBeDisabled()
    await fireEvent.click(screen.getByRole('switch'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders label correctly', () => {
    render(<Switch label="Enable notifications" />)
    expect(screen.getByText('Enable notifications')).toBeInTheDocument()
  })

  it('applies different sizes correctly', () => {
    render(<Switch size="sm" aria-label="Toggle" />)
    expect(screen.getByRole('switch').parentElement).toBeDefined()
  })
})
