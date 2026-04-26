import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Avatar, AvatarGroup } from './Avatar'

describe('Avatar', () => {
  it('renders correctly with default props', () => {
    render(<Avatar>JD</Avatar>)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('renders image correctly when src is provided', () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User" />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('applies different sizes correctly', () => {
    const { rerender } = render(<Avatar size="sm">JD</Avatar>)
    expect(screen.getByText('JD').parentElement).toHaveClass('w-8')

    rerender(<Avatar size="md">JD</Avatar>)
    expect(screen.getByText('JD').parentElement).toHaveClass('w-10')

    rerender(<Avatar size="lg">JD</Avatar>)
    expect(screen.getByText('JD').parentElement).toHaveClass('w-12')
  })

  it('applies custom className correctly', () => {
    render(<Avatar className="custom-class">JD</Avatar>)
    expect(screen.getByText('JD').parentElement).toHaveClass('custom-class')
  })
})

describe('AvatarGroup', () => {
  it('renders multiple avatars with spacing', () => {
    render(
      <AvatarGroup>
        <Avatar>JD</Avatar>
        <Avatar>AB</Avatar>
        <Avatar>CD</Avatar>
      </AvatarGroup>
    )

    const avatars = screen.getAllByText(/[A-Z]{2}/)
    expect(avatars).toHaveLength(3)
  })

  it('renders count when max is exceeded', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar>JD</Avatar>
        <Avatar>AB</Avatar>
        <Avatar>CD</Avatar>
        <Avatar>EF</Avatar>
      </AvatarGroup>
    )

    expect(screen.getByText('+2')).toBeInTheDocument()
  })
})
