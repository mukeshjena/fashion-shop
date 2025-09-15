import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../ui/LoadingSpinner'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = true 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, initialized } = useAuth()
  const location = useLocation()
  // No additional state management needed - using initialized from useAuth

  // Show loading only during actual initialization
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {!initialized ? 'Initializing...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  // Redirect if no user after initialization
  if (!user && initialized) {
    console.log('🔒 No user found, redirecting to login')
    return (
      <Navigate 
        to="/admin/login" 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Check admin permissions
  if (requireAdmin && user && !isAdmin) {
    console.log('❌ User is not admin:', user.email, 'Role:', user.role)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You don't have permission to access this area.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated and has proper permissions
   console.log('✅ Access granted for user:', user?.email, 'Admin:', isAdmin)
   return <>{children}</>
 }