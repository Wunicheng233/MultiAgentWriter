import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CanvasContainer } from '../components/layout/CanvasContainer'

describe('Focus Mode', () => {
  it('should apply wider max-width when focus mode is enabled', () => {
    const { getByTestId } = render(
      <CanvasContainer focusMode={true}>
        <div>Content</div>
      </CanvasContainer>
    )

    const canvasContent = getByTestId('canvas-content') as HTMLElement
    expect(canvasContent.style.maxWidth).toContain('900')
  })

  it('should use default max-width when focus mode is disabled', () => {
    const { getByTestId } = render(
      <CanvasContainer focusMode={false}>
        <div>Content</div>
      </CanvasContainer>
    )

    const canvasContent = getByTestId('canvas-content') as HTMLElement
    expect(canvasContent.style.maxWidth).toBe('720px')
  })

  it('should use custom max-width when provided', () => {
    const { getByTestId } = render(
      <CanvasContainer maxWidth={800} focusMode={false}>
        <div>Content</div>
      </CanvasContainer>
    )

    const canvasContent = getByTestId('canvas-content') as HTMLElement
    expect(canvasContent.style.maxWidth).toBe('800px')
  })

  it('should apply wider max-width even with custom max-width in focus mode', () => {
    const { getByTestId } = render(
      <CanvasContainer maxWidth={800} focusMode={true}>
        <div>Content</div>
      </CanvasContainer>
    )

    const canvasContent = getByTestId('canvas-content') as HTMLElement
    expect(canvasContent.style.maxWidth).toBe('900px')
  })
})
