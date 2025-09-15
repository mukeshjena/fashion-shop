import React from 'react'
import { motion } from 'framer-motion'
import { Save, X, AlertCircle } from 'lucide-react'
import Modal from './Modal'
import { cn } from '../../utils'

interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  title: string
  subtitle?: string
  children: React.ReactNode
  submitText?: string
  cancelText?: string
  isSubmitting?: boolean
  hasUnsavedChanges?: boolean
  errors?: Record<string, string>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  submitIcon?: React.ReactNode
  submitVariant?: 'primary' | 'secondary' | 'danger'
}

const submitVariants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
}

export default function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  subtitle,
  children,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitting = false,
  hasUnsavedChanges = false,
  errors = {},
  size = 'md',
  submitIcon,
  submitVariant = 'primary'
}: FormModalProps) {
  
  const handleClose = () => {
    if (hasUnsavedChanges && !isSubmitting) {
      // In a real implementation, you might want to show a confirmation dialog
      // For now, we'll just close
    }
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSubmitting) {
      onSubmit(e)
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={size}
      closeOnOverlayClick={!hasUnsavedChanges}
      closeOnEscape={!hasUnsavedChanges}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white font-display">
                {title}
              </h3>
              {hasUnsavedChanges && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  Unsaved
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
        
        {/* Error Summary */}
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-6 py-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Please fix the following errors:
                </h4>
                <ul className="mt-1 text-sm text-red-700 dark:text-red-300 space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-white/10 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || hasErrors}
            className={cn(
              'inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
              submitVariants[submitVariant]
            )}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                />
                Saving...
              </>
            ) : (
              <>
                {submitIcon || <Save className="w-4 h-4 mr-2" />}
                {submitText}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Form field components with enhanced styling
export function FormField({ 
  label, 
  error, 
  required, 
  children, 
  className 
}: { 
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.p>
      )}
    </div>
  )
}

export function FormInput({ 
  error, 
  className, 
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      className={cn(
        'w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-4',
        error
          ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
          : 'border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-black/20 dark:focus:ring-white/20',
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
        className
      )}
      {...props}
    />
  )
}

export function FormTextarea({ 
  error, 
  className, 
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <textarea
      className={cn(
        'w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-4 resize-none',
        error
          ? 'border-red-300 dark:border-red-700 focus:border-red-500 focus:ring-red-500/20'
          : 'border-gray-300 dark:border-gray-600 focus:border-black dark:focus:border-white focus:ring-black/20 dark:focus:ring-white/20',
        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
        className
      )}
      {...props}
    />
  )
}