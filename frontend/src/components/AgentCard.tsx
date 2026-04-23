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
  idle: 'bg-secondary/10 text-secondary',
  running: 'bg-sage/10 text-sage',
  done: 'bg-muted-gold/15 text-muted-gold',
  error: 'bg-terracotta/10 text-terracotta',
}

export const AgentCard: React.FC<AgentCardProps> = ({
  name,
  status,
  output,
}) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className={`border border-border rounded-standard mb-3 overflow-hidden cursor-pointer ${
        status === 'running' ? 'shadow-ambient' : ''
      }`}
      onClick={() => output && setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <Badge variant="agent">{name.toUpperCase()}</Badge>
        <span className={`text-sm px-3 py-1 rounded-full ${statusClasses[status]}`}>
          {statusText[status]}
        </span>
        {output && (
          <svg
            className={`w-5 h-5 text-secondary transition-transform ${
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
        <div className="px-4 pb-4 border-t border-border">
          <div className="mt-3 prose-novel text-sm whitespace-pre-line">
            {output}
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentCard
