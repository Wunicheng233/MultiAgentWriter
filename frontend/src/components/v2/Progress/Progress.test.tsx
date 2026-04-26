import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress, CircularProgress } from './Progress'

describe('Progress', () => {
  it('renders correctly with default props', () => {
    render(<Progress value={50} />)
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
  })

  it('applies correct width based on value', () => {
    render(<Progress value={75} />)
    const bar = screen.getByTestId('progress-bar').firstChild as HTMLElement
    expect(bar.style.width).toBe('75%')
  })

  it('clamps value between 0 and 100', () => {
    const { rerender } = render(<Progress value={150} />)
    let bar = screen.getByTestId('progress-bar').firstChild as HTMLElement
    expect(bar.style.width).toBe('100%')

    rerender(<Progress value={-20} />)
    bar = screen.getByTestId('progress-bar').firstChild as HTMLElement
    expect(bar.style.width).toBe('0%')
  })

  it('applies custom className', () => {
    render(<Progress value={50} className="custom-class" />)
    expect(screen.getByTestId('progress-bar')).toHaveClass('custom-class')
  })

  it('shows indeterminate state', () => {
    render(<Progress indeterminate />)
    const bar = screen.getByTestId('progress-bar').firstChild as HTMLElement
    expect(bar).toHaveClass('animate-[progress-indeterminate_1.5s_ease-in-out_infinite]')
  })

  it('applies different sizes', () => {
    const { rerender } = render(<Progress value={50} size="sm" />)
    let bar = screen.getByTestId('progress-bar')
    expect(bar).toHaveClass('h-1')

    rerender(<Progress value={50} size="lg" />)
    bar = screen.getByTestId('progress-bar')
    expect(bar).toHaveClass('h-3')
  })

  it('displays label when showLabel is true', () => {
    render(<Progress value={50} showLabel />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })
})

describe('CircularProgress', () => {
  it('renders correctly with default props', () => {
    render(<CircularProgress value={50} />)
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument()
  })

  it('applies correct strokeDashoffset based on value', () => {
    render(<CircularProgress value={50} />)
    const circle = screen.getByTestId('circular-progress').querySelector('circle:last-child') as SVGElement | null
    expect(circle?.style.strokeDashoffset).toBeTruthy()
  })

  it('clamps value between 0 and 100', () => {
    const { rerender } = render(<CircularProgress value={150} />)
    let circle = screen.getByTestId('circular-progress').querySelector('circle:last-child') as SVGElement | null
    expect(circle?.style.strokeDasharray).toBeTruthy()

    rerender(<CircularProgress value={-20} />)
    circle = screen.getByTestId('circular-progress').querySelector('circle:last-child') as SVGElement | null
    expect(circle?.style.strokeDasharray).toBeTruthy()
  })

  it('shows indeterminate state', () => {
    render(<CircularProgress indeterminate />)
    const container = screen.getByTestId('circular-progress')
    expect(container.firstChild).toHaveClass('animate-spin')
  })

  it('applies different sizes', () => {
    const { rerender } = render(<CircularProgress value={50} size={40} />)
    let svg = screen.getByTestId('circular-progress').firstChild as SVGElement
    expect(svg.getAttribute('width')).toBe('40')

    rerender(<CircularProgress value={50} size={80} />)
    svg = screen.getByTestId('circular-progress').firstChild as SVGElement
    expect(svg.getAttribute('width')).toBe('80')
  })

  it('displays label when showLabel is true', () => {
    render(<CircularProgress value={75} showLabel />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})
