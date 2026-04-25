import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResizeHandle } from '../components/layout/ResizeHandle'

describe('Resize Handle', () => {
  it('should render the resize handle', () => {
    render(<ResizeHandle onResize={() => {}} currentWidth={320} />)
    expect(screen.getByTestId('resize-handle')).toBeTruthy()
  })

  it('should have correct cursor style', () => {
    render(<ResizeHandle onResize={() => {}} currentWidth={320} />)
    const handle = screen.getByTestId('resize-handle')
    expect(handle.className).toContain('cursor-ew-resize')
  })

  it('should call onResize when dragging', () => {
    const mockOnResize = vi.fn()
    render(<ResizeHandle onResize={mockOnResize} currentWidth={320} />)

    const handle = screen.getByTestId('resize-handle')
    fireEvent.mouseDown(handle)

    // Simulate mouse move
    fireEvent.mouseMove(document, { clientX: window.innerWidth - 360 })
    fireEvent.mouseUp(document)

    // onResize should be called during the drag
    expect(mockOnResize).toHaveBeenCalled()
  })

  it('should clamp width between min and max values', () => {
    const mockOnResize = vi.fn()
    render(<ResizeHandle onResize={mockOnResize} currentWidth={320} minWidth={240} maxWidth={480} />)

    const handle = screen.getByTestId('resize-handle')
    fireEvent.mouseDown(handle)

    // Try to drag beyond max width
    fireEvent.mouseMove(document, { clientX: 100 }) // This would result in a very large width
    fireEvent.mouseUp(document)

    // The clamped value should be passed
    const lastCall = mockOnResize.mock.calls[mockOnResize.mock.calls.length - 1][0]
    expect(lastCall).toBeLessThanOrEqual(480)
  })

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
    const { unmount } = render(<ResizeHandle onResize={() => {}} currentWidth={320} />)

    const handle = screen.getByTestId('resize-handle')
    fireEvent.mouseDown(handle)
    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalled()
  })
})
