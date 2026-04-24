import React from 'react'

interface ProgressBarProps {
  progress: number // 0-100
  message?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, message }) => {
  return (
    <div className="w-full space-y-2">
      {message && (
        <div className="flex justify-between text-sm text-secondary">
          <span>{message}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/70">
        <div
          className="h-full rounded-full bg-sage transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
