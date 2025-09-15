import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, HelpCircle, Trash2, CheckCircle } from 'lucide-react'
import { cn } from '../../utils'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
  icon?: React.ReactNode
}

const typeConfig = {
  danger: {
    icon: Trash2,
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
    confirmText: 'Delete'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    confirmText: 'Continue'
  },
  info: {
    icon: HelpCircle,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    confirmText: 'Confirm'
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    confirmButton: 'bg-green-600 hover:bg-green-700 text-white',
    confirmText: 'Confirm'
  }
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50
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
    y: 50,
    transition: {
      duration: 0.2
    }
  }
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText,
  cancelText = 'Cancel',
  icon
}: ConfirmDialogProps) {
  const config = typeConfig[type]
  const IconComponent = config.icon
  const defaultConfirmText = confirmText || config.confirmText

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            className="glass-modal relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Icon */}
              <div className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                config.iconBg
              )}>
                {icon || <IconComponent className={cn('w-8 h-8', config.iconColor)} />}
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {message}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex space-x-3 w-full pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300/50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={cn(
                    'flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 transform hover:scale-105 active:scale-95',
                    config.confirmButton
                  )}
                >
                  {defaultConfirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}