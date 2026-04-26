import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Alert } from './Alert'

describe('Alert', () => {
  it('renders correctly with default props', () => {
    render(<Alert>Alert message</Alert>)
    expect(screen.getByText('Alert message')).toBeInTheDocument()
  })

  it('renders title correctly', () => {
    render(<Alert title="Success">Operation completed</Alert>)
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Operation completed')).toBeInTheDocument()
  })

  it('applies variant styles correctly', () => {
    const { rerender } = render(<Alert variant="success">Success</Alert>)
    expect(screen.getByRole('alert')).toHaveClass('border-l-[var(--accent-primary)]')

    rerender(<Alert variant="warning">Warning</Alert>)
    expect(screen.getByRole('alert')).toHaveClass('border-l-[var(--accent-gold)]')

    rerender(<Alert variant="error">Error</Alert>)
    expect(screen.getByRole('alert')).toHaveClass('border-l-[var(--accent-warm)]')

    rerender(<Alert variant="info">Info</Alert>)
    expect(screen.getByRole('alert')).toHaveClass('border-l-[var(--accent-primary)]')
  })

  it('shows close button when closable is true', () => {
    render(<Alert closable>Closable alert</Alert>)
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    render(<Alert closable onClose={onClose}>Alert</Alert>)

    await fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('applies custom className correctly', () => {
    render(<Alert className="custom-class">Alert</Alert>)
    expect(screen.getByRole('alert')).toHaveClass('custom-class')
  })
})
