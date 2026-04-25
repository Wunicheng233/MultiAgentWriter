import React from 'react'

interface PublicLayoutProps {
  children: React.ReactNode
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* 顶部标题栏 */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-primary)] bg-opacity-90 backdrop-blur-lg border-b border-[var(--border-default)]">
        <div className="max-w-6xl mx-auto px-6 h-[64px] flex items-center justify-center">
          <span className="font-serif text-2xl text-[var(--text-primary)] font-normal">
            MultiAgentWriter
          </span>
        </div>
      </nav>

      {/* 内容区域 */}
      {children}
    </div>
  )
}

export default PublicLayout
