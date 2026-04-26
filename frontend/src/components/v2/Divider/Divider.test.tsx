import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Divider } from './Divider'

describe('Divider', () => {
  it('renders correctly as horizontal by default', () => {
    render(<Divider />)
    const divider = screen.getByRole('separator')
    expect(divider).toBeInTheDocument()
    expect(divider).toHaveClass('h-px')
  })

  it('renders as vertical when orientation is vertical', () => {
    render(<Divider orientation="vertical" style={{ height: '100px' }} />)
    const divider = screen.getByRole('separator')
    expect(divider).toHaveClass('w-px')
  })

  it('renders with text correctly', () => {
    render(<Divider>Or continue with</Divider>)
    expect(screen.getByText('Or continue with')).toBeInTheDocument()
  })

  it('applies dashed style correctly', () => {
    render(<Divider dashed />)
    expect(screen.getByRole('separator')).toHaveClass('border-dashed')
  })

  it('applies custom className correctly', () => {
    render(<Divider className="custom-class" />)
    expect(screen.getByRole('separator')).toHaveClass('custom-class')
  })
})
