import { render, screen } from '@testing-library/react'
import { Card } from './Card'
import { expect, describe, test } from 'vitest'

describe('Card', () => {
  test('renders with default variant by default', () => {
    render(<Card>Test content</Card>)
    const card = screen.getByText('Test content').closest('div')
    expect(card).toHaveClass('bg-white/60')
    expect(card).toHaveClass('border-border')
  })

  test('renders with elevated variant when specified', () => {
    render(<Card variant="elevated">Test content</Card>)
    const card = screen.getByText('Test content').closest('div')
    expect(card).toHaveClass('bg-white')
    expect(card).toHaveClass('border-sage/20')
    expect(card).toHaveClass('shadow-elevated')
  })

  test('renders with outlined variant when specified', () => {
    render(<Card variant="outlined">Test content</Card>)
    const card = screen.getByText('Test content').closest('div')
    expect(card).toHaveClass('bg-transparent')
    expect(card).toHaveClass('border-2')
    expect(card).toHaveClass('border-border')
  })
})
