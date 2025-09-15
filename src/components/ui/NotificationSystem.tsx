import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Alert from './Alert'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  autoClose?: boolean
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void
  showSuccess: (message: string, title?: string) => void
  showError: (message: string, title?: string) => void
  showWarning: (message: string, title?: string) => void
  showInfo: (message: string, title?: string) => void
  hideNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
  maxNotifications?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

const positionClasses = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 5,
  position = 'top-right'
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId()
    const newNotification: Notification = {
      id,
      autoClose: true,
      duration: 5000,
      ...notification
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      return updated.slice(0, maxNotifications)
    })
  }, [maxNotifications])

  const showSuccess = useCallback((message: string, title?: string) => {
    showNotification({ type: 'success', message, title })
  }, [showNotification])

  const showError = useCallback((message: string, title?: string) => {
    showNotification({ type: 'error', message, title, duration: 8000 })
  }, [showNotification])

  const showWarning = useCallback((message: string, title?: string) => {
    showNotification({ type: 'warning', message, title, duration: 6000 })
  }, [showNotification])

  const showInfo = useCallback((message: string, title?: string) => {
    showNotification({ type: 'info', message, title })
  }, [showNotification])

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const value: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
    clearAll
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Notification Container */}
      <div className={`fixed z-50 ${positionClasses[position]} pointer-events-none`}>
        <div className="space-y-3 pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 300 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Alert
                  type={notification.type}
                  title={notification.title}
                  message={notification.message}
                  isVisible={true}
                  onClose={() => hideNotification(notification.id)}
                  autoClose={notification.autoClose}
                  duration={notification.duration}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </NotificationContext.Provider>
  )
}

// Custom hook for replacing browser alerts
export const useAlert = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotification()

  const confirm = (message: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // For now, we'll use a simple approach
      // In a full implementation, you'd create a custom confirm dialog
      const result = window.confirm(title ? `${title}\n\n${message}` : message)
      resolve(result)
    })
  }

  const alert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
    switch (type) {
      case 'success':
        showSuccess(message, title)
        break
      case 'error':
        showError(message, title)
        break
      case 'warning':
        showWarning(message, title)
        break
      default:
        showInfo(message, title)
    }
  }

  return { alert, confirm, showSuccess, showError, showWarning, showInfo }
}