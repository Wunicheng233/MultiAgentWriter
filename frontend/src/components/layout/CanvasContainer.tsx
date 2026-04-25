import React, { useMemo } from 'react'

interface CanvasContainerProps {
  children: React.ReactNode
  maxWidth?: number
  focusMode?: boolean
}

export const CanvasContainer: React.FC<CanvasContainerProps> = React.memo(({
  children,
  maxWidth = 720,
  focusMode = false,
}) => {
  const contentMaxWidth = useMemo(() =>
    focusMode ? Math.max(maxWidth, 900) : maxWidth,
    [focusMode, maxWidth]
  )

  return (
    <main
      className={`w-full h-full overflow-auto transition-all duration-200 ease-out content-visibility-auto ${
        focusMode ? 'focus-mode-active' : ''
      }`}
      style={{
        paddingTop: '64px',
        paddingBottom: '128px',
      }}
      data-testid="canvas-container"
      role="main"
      aria-label="Main content area"
    >
      <div
        className="mx-auto"
        style={{
          maxWidth: contentMaxWidth,
          transition: 'max-width 200ms ease-out',
          willChange: 'max-width',
        }}
        data-testid="canvas-content"
      >
        {children}
      </div>
    </main>
  )
})

CanvasContainer.displayName = 'CanvasContainer'

export default CanvasContainer
