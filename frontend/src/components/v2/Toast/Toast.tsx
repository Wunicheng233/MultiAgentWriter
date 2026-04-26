import { useState, useCallback } from 'react'
import { createContext, useContext } from 'react'
import { Alert } from '../Alert/Alert'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  message: string
  type: ToastType
}

export interface ToastContextType {
  showToast: (message: string, type: ToastType) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 min-w-[280px]">
        {toasts.map(toast => (
          <Alert
            key={toast.id}
            variant={toast.type === 'error' ? 'error' : toast.type}
            closable
          >
            {toast.message}
          </Alert>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
