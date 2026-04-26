import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders correctly with default props', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText(/card content/i)).toBeInTheDocument()
  })

  it('applies variant correctly', () => {
    const { container, rerender } = render(<Card variant="default">Default</Card>)
    const cardElement = container.firstChild as HTMLElement
    expect(cardElement).toHaveClass(/shadow-/)

    rerender(<Card variant="elevated">Elevated</Card>)
    const elevatedCard = container.firstChild as HTMLElement
    expect(elevatedCard).toHaveClass(/shadow-/)
  })

  it('applies padding correctly', () => {
    const { container, rerender } = render(<Card padding="none">No Padding</Card>)
    const cardElement = container.firstChild as HTMLElement
    expect(cardElement).toHaveClass('p-0')

    rerender(<Card padding="lg">Large Padding</Card>)
    const lgCard = container.firstChild as HTMLElement
    expect(lgCard).toHaveClass('p-8')
  })

  it('applies hoverable classes correctly', () => {
    const { container } = render(<Card hoverable>Hoverable Card</Card>)
    const cardElement = container.firstChild as HTMLElement
    expect(cardElement).toHaveClass(/hover:/)
    expect(cardElement).toHaveClass('cursor-pointer')
  })

  it('forwards additional props correctly', () => {
    render(<Card data-testid="test-card" aria-label="Test Card">Content</Card>)
    expect(screen.getByTestId('test-card')).toHaveAttribute('aria-label', 'Test Card')
  })
})
