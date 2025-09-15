import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl mx-4'
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const
    }
  }
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
      damping: 30,
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
      ease: 'easeIn' as const
    }
  }
}

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className
}: ModalProps) {
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeOnEscape, onClose])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            className={cn(
              'glass-modal relative w-full rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden',
              sizeClasses[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-white/10">
                <div className="flex-1">
                  {title && (
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-display">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>
                
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 group"
                  >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Convenience components for common modal patterns
export function ModalHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4 border-b border-white/10', className)}>
      {children}
    </div>
  )
}

export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-6', className)}>
      {children}
    </div>
  )
}

export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 py-4 border-t border-white/10 bg-gray-50/50 dark:bg-gray-900/50', className)}>
      {children}
    </div>
  )
}