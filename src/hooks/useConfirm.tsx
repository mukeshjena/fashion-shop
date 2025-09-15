import React, { createContext, useContext, useState, useCallback } from 'react'
import ConfirmDialog from '../components/ui/ConfirmDialog'

interface ConfirmOptions {
  title: string
  message: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
  icon?: React.ReactNode
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export const useConfirm = () => {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context
}

interface ConfirmState {
  isOpen: boolean
  options: ConfirmOptions
  resolve: (value: boolean) => void
}

interface ConfirmProviderProps {
  children: React.ReactNode
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (confirmState) {
      confirmState.resolve(true)
      setConfirmState(null)
    }
  }, [confirmState])

  const handleCancel = useCallback(() => {
    if (confirmState) {
      confirmState.resolve(false)
      setConfirmState(null)
    }
  }, [confirmState])

  const value: ConfirmContextType = {
    confirm
  }

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      
      {confirmState && (
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          onClose={handleCancel}
          onConfirm={handleConfirm}
          title={confirmState.options.title}
          message={confirmState.options.message}
          type={confirmState.options.type}
          confirmText={confirmState.options.confirmText}
          cancelText={confirmState.options.cancelText}
          icon={confirmState.options.icon}
        />
      )}
    </ConfirmContext.Provider>
  )
}

// Convenience hooks for common confirmation types
export const useDeleteConfirm = () => {
  const { confirm } = useConfirm()
  
  return useCallback((itemName?: string) => {
    return confirm({
      title: 'Delete Item',
      message: itemName 
        ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
        : 'Are you sure you want to delete this item? This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    })
  }, [confirm])
}

export const useDiscardChanges = () => {
  const { confirm } = useConfirm()
  
  return useCallback(() => {
    return confirm({
      title: 'Discard Changes',
      message: 'You have unsaved changes. Are you sure you want to discard them?',
      type: 'warning',
      confirmText: 'Discard',
      cancelText: 'Keep Editing'
    })
  }, [confirm])
}

export const useLogoutConfirm = () => {
  const { confirm } = useConfirm()
  
  return useCallback(() => {
    return confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      type: 'info',
      confirmText: 'Sign Out',
      cancelText: 'Stay Signed In'
    })
  }, [confirm])
}