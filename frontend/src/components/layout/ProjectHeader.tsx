import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '../../store/useProjectStore'
import { Badge } from '../v2/Badge/Badge'

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'error'; label: string }> = {
  draft: { variant: 'default', label: '草稿' },
  generating: { variant: 'warning', label: '生成中' },
  waiting_confirm: { variant: 'warning', label: '待确认' },
  completed: { variant: 'success', label: '已完成' },
  failed: { variant: 'error', label: '失败' },
}

export const ProjectHeader: React.FC = () => {
  const navigate = useNavigate()
  const { currentProjectName, projectStatus, progressPercent, clearCurrentProject } = useProjectStore()

  const handleBack = () => {
    clearCurrentProject()
    navigate('/dashboard')
  }

  const config = statusConfig[projectStatus]
  const showProgress = projectStatus === 'generating'

  return (
    <header className="h-16 flex items-center px-6 border-b border-[var(--border-default)] bg-[var(--bg-primary)]">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>书架</span>
      </button>

      <div className="flex-1 flex items-center gap-4 ml-6">
        <h1 className="text-lg font-medium text-[var(--text-primary)]">{currentProjectName}</h1>
        <Badge variant={config.variant}>
          <span className="flex items-center gap-2">
            {showProgress && (
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            )}
            {config.label}
            {showProgress && <span>{progressPercent}%</span>}
          </span>
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </header>
  )
}
