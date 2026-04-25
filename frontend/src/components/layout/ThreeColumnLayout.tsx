import React, { useMemo } from 'react'

interface ThreeColumnLayoutProps {
  nav: React.ReactNode
  canvas: React.ReactNode
  rightPanel: React.ReactNode
  rightPanelOpen?: boolean
  rightPanelWidth?: number
  navCollapsed?: boolean
}

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = React.memo(({
  nav,
  canvas,
  rightPanel,
  rightPanelOpen = false,
  rightPanelWidth = 320,
  navCollapsed = false,
}) => {
  const navWidth = useMemo(() => navCollapsed ? '12px' : '60px', [navCollapsed])
  const rightPanelStyle = useMemo(() => ({
    width: rightPanelOpen ? `${rightPanelWidth}px` : '0px',
    minWidth: rightPanelOpen ? `${rightPanelWidth}px` : '0px',
    willChange: 'width, min-width',
  }), [rightPanelOpen, rightPanelWidth])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-primary)]">
      {/* Left Nav Rail */}
      <div
        className="flex-shrink-0 transition-all duration-200 ease-out"
        style={{ width: navWidth, willChange: 'width' }}
        data-testid="nav-container"
      >
        {nav}
      </div>

      {/* Center Canvas */}
      <div className="flex-1 overflow-auto relative content-visibility-auto" data-testid="canvas-container">
        {canvas}
      </div>

      {/* Right AI Panel */}
      <div
        className="flex-shrink-0 transition-all duration-200 ease-out overflow-hidden"
        style={rightPanelStyle}
        data-testid="right-panel-container"
      >
        {rightPanel}
      </div>
    </div>
  )
})

ThreeColumnLayout.displayName = 'ThreeColumnLayout'

export default ThreeColumnLayout
