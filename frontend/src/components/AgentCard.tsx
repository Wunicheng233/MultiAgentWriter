import React, { useState } from 'react'
import Badge from './Badge'

interface AgentCardProps {
  name: string
  status: 'idle' | 'running' | 'done' | 'error'
  output?: string
}

const statusText = {
  idle: '等待',
  running: '运行中',
  done: '完成',
  error: '失败',
}

const statusClasses = {
  idle: 'bg-[var(--text-secondary)] bg-opacity-10 text-[var(--text-secondary)]',
  running: 'bg-[var(--accent-primary)] bg-opacity-10 text-[var(--accent-primary)]',
  done: 'bg-[var(--accent-gold)] bg-opacity-15 text-[var(--accent-gold)]',
  error: 'bg-[var(--accent-warm)] bg-opacity-10 text-[var(--accent-warm)]',
}

export const AgentCard: React.FC<AgentCardProps> = ({
  name,
  status,
  output,
}) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`inspector-card border border-[var(--border-default)] rounded-comfortable mb-3 overflow-hidden cursor-pointer transition-all duration-150 ${
        status === 'running' ? 'shadow-[var(--shadow-default)]' : ''
      }`}
      onClick={() => output && setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className={`agent-status-indicator ${status === 'running' ? 'running' : ''} ${
            status === 'done' ? 'bg-[var(--accent-gold)]' :
            status === 'error' ? 'bg-[var(--accent-warm)]' :
            status === 'running' ? 'bg-[var(--accent-primary)]' :
            'bg-[var(--text-muted)]'
          }`}></span>
          <Badge variant="agent">{name.toUpperCase()}</Badge>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full ${statusClasses[status]} ${status === 'running' ? 'badge-pulse' : ''}`}>
          {statusText[status]}
        </span>
        {output && (
          <svg
            className={`w-5 h-5 text-[var(--text-secondary)] transition-transform ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </div>
      {expanded && output && (
        <div className="px-4 pb-4 border-t border-[var(--border-default)]">
          <div className="mt-3 text-sm whitespace-pre-line text-[var(--text-body)]">
            {output}
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentCard
