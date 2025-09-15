import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '../../utils'

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  isVisible: boolean
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

const alertVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: -50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -50,
    transition: {
      duration: 0.2
    }
  }
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

const colorMap = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-800 dark:text-green-200'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-800 dark:text-red-200'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-800 dark:text-yellow-200'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-800 dark:text-blue-200'
  }
}

export default function Alert({
  type = 'info',
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}: AlertProps) {
  const Icon = iconMap[type]
  const colors = colorMap[type]

  React.useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, isVisible, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={alertVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            'glass-card p-4 rounded-xl border max-w-md w-full',
            colors.bg,
            colors.border
          )}
        >
          <div className="flex items-start space-x-3">
            <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', colors.icon)} />
            
            <div className="flex-1 min-w-0">
              {title && (
                <h4 className={cn('text-sm font-semibold mb-1', colors.text)}>
                  {title}
                </h4>
              )}
              <p className={cn('text-sm', colors.text)}>
                {message}
              </p>
            </div>
            
            <button
              onClick={onClose}
              className={cn(
                'flex-shrink-0 p-1 rounded-lg transition-colors duration-200',
                'hover:bg-black/10 dark:hover:bg-white/10',
                colors.text
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}