import React from 'react'
import ResizeHandle from './ResizeHandle'

interface RightPanelProps {
  open: boolean
  width: number
  onResize: (width: number) => void
  children: React.ReactNode
}

export const RightPanel: React.FC<RightPanelProps> = React.memo(({ open, width, onResize, children }) => {
  return (
    <aside
      className="h-full bg-[var(--bg-secondary)] flex flex-col border-l border-[var(--border-default)] relative"
      data-testid="right-panel"
      style={{ width: '100%', willChange: 'width' }}
      aria-label="AI assistant panel"
      role="complementary"
    >
      {open && <ResizeHandle onResize={onResize} currentWidth={width} minWidth={240} maxWidth={480} />}
      {children}
    </aside>
  )
})

RightPanel.displayName = 'RightPanel'

export default RightPanel
