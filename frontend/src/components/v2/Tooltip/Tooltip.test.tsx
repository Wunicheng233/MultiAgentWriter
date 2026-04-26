import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('does not show tooltip content by default', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    const tooltipWrapper = screen.getByText(/Tooltip text/i).parentElement
    expect(tooltipWrapper).toHaveClass('opacity-0')
  })

  it('shows tooltip content on mouse enter', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )

    await user.hover(screen.getByText(/Hover me/i))
    await waitFor(() => {
      expect(screen.getByText(/Tooltip text/i)).toBeInTheDocument()
    })
  })

  it('hides tooltip content on mouse leave', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )

    await user.hover(screen.getByText(/Hover me/i))
    await waitFor(() => {
      expect(screen.getByText(/Tooltip text/i).parentElement).toHaveClass('opacity-100')
    })

    await user.unhover(screen.getByText(/Hover me/i))
    await waitFor(() => {
      expect(screen.getByText(/Tooltip text/i).parentElement).toHaveClass('opacity-0')
    })
  })

  it('applies correct position class', async () => {
    const user = userEvent.setup({ delay: null })
    const { rerender } = render(
      <Tooltip content="Top tooltip" position="top">
        <button>Target</button>
      </Tooltip>
    )

    await user.hover(screen.getByText(/Target/i))
    await waitFor(() => {
      expect(screen.getByText(/Top tooltip/i).parentElement).toHaveClass(/bottom-full/)
    })

    rerender(
      <Tooltip content="Bottom tooltip" position="bottom">
        <button>Target</button>
      </Tooltip>
    )

    await waitFor(() => {
      expect(screen.getByText(/Bottom tooltip/i).parentElement).toHaveClass(/top-full/)
    })
  })

  it('shows tooltip on focus', async () => {
    render(
      <Tooltip content="Focus tooltip">
        <button>Focus me</button>
      </Tooltip>
    )

    fireEvent.focus(screen.getByText(/Focus me/i))
    await waitFor(() => {
      expect(screen.getByText(/Focus tooltip/i)).toBeInTheDocument()
    })
  })

  it('hides tooltip on blur', async () => {
    render(
      <Tooltip content="Focus tooltip">
        <button>Focus me</button>
      </Tooltip>
    )

    fireEvent.focus(screen.getByText(/Focus me/i))
    await waitFor(() => {
      expect(screen.getByText(/Focus tooltip/i).parentElement).toHaveClass('opacity-100')
    })

    fireEvent.blur(screen.getByText(/Focus me/i))
    await waitFor(() => {
      expect(screen.getByText(/Focus tooltip/i).parentElement).toHaveClass('opacity-0')
    })
  })

  it('applies custom className correctly', async () => {
    const user = userEvent.setup({ delay: null })
    render(
      <Tooltip content="Custom tooltip" className="custom-tooltip-class">
        <button>Target</button>
      </Tooltip>
    )

    await user.hover(screen.getByText(/Target/i))
    await waitFor(() => {
      expect(screen.getByText(/Custom tooltip/i)).toHaveClass('custom-tooltip-class')
    })
  })
})
