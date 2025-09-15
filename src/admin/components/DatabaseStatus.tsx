import { useState, useEffect } from 'react'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  Users, 
  Package, 
  Image, 
  FileText,
  HardDrive
} from 'lucide-react'
import { DatabaseService } from '../../services/databaseService'
import { AuthService } from '../../services/authService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

interface HealthStatus {
  healthy: boolean
  connection: boolean
  tables: boolean
  storage: boolean
  settings: boolean
  pages: boolean
  adminExists: boolean
  errors: string[]
}

export default function DatabaseStatus() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkHealth()
  }, [])

  const checkHealth = async () => {
    try {
      setLoading(true)
      setError(null)
      const status = await DatabaseService.healthCheck()
      setHealthStatus(status)
    } catch (err) {
      console.error('Health check error:', err)
      setError('Failed to check database health')
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    try {
      setInitializing(true)
      setError(null)
      
      const result = await DatabaseService.initializeDatabase()
      
      if (result.success) {
        // Refresh health status
        await checkHealth()
      } else {
        setError(`Initialization failed: ${result.errors.join(', ')}`)
      }
    } catch (err) {
      console.error('Database initialization error:', err)
      setError('Failed to initialize database')
    } finally {
      setInitializing(false)
    }
  }

  const createAdminUser = async () => {
    const email = prompt('Enter admin email:')
    const password = prompt('Enter admin password:')
    
    if (!email || !password) return

    try {
      setLoading(true)
      const result = await AuthService.createAdminUser(email, password)
      
      if (result.user) {
        alert('Admin user created successfully!')
        await checkHealth()
      } else {
        setError(result.error || 'Failed to create admin user')
      }
    } catch (err) {
      console.error('Create admin error:', err)
      setError('Failed to create admin user')
    } finally {
      setLoading(false)
    }
  }

  const StatusIcon = ({ status }: { status: boolean }) => {
    return status ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  }

  const StatusBadge = ({ status, label }: { status: boolean; label: string }) => {
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        status 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      }`}>
        <StatusIcon status={status} />
        <span className="ml-2">{label}</span>
      </div>
    )
  }

  if (loading && !healthStatus) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Database Status
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage your database health
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={checkHealth}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {healthStatus && !healthStatus.healthy && (
            <button
              onClick={initializeDatabase}
              disabled={initializing}
              className="btn-primary flex items-center space-x-2"
            >
              {initializing && <LoadingSpinner size="sm" />}
              <span>Initialize Database</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-red-800 dark:text-red-200 font-medium">Error</span>
          </div>
          <p className="text-red-700 dark:text-red-300 mt-2">{error}</p>
        </div>
      )}

      {/* Overall Status */}
      {healthStatus && (
        <div className={`rounded-lg border p-6 ${
          healthStatus.healthy
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center space-x-3">
            <StatusIcon status={healthStatus.healthy} />
            <div>
              <h3 className={`text-lg font-semibold ${
                healthStatus.healthy
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-red-800 dark:text-red-200'
              }`}>
                Database {healthStatus.healthy ? 'Healthy' : 'Issues Detected'}
              </h3>
              <p className={`text-sm ${
                healthStatus.healthy
                  ? 'text-green-600 dark:text-green-300'
                  : 'text-red-600 dark:text-red-300'
              }`}>
                {healthStatus.healthy
                  ? 'All systems are operational'
                  : `${healthStatus.errors.length} issue(s) found`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Status */}
      {healthStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Connection Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Database className="w-6 h-6 text-blue-600" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Connection</h4>
            </div>
            <StatusBadge 
              status={healthStatus.connection} 
              label={healthStatus.connection ? 'Connected' : 'Disconnected'} 
            />
          </div>

          {/* Tables Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <HardDrive className="w-6 h-6 text-purple-600" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Tables</h4>
            </div>
            <StatusBadge 
              status={healthStatus.tables} 
              label={healthStatus.tables ? 'All Present' : 'Missing Tables'} 
            />
          </div>

          {/* Storage Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Image className="w-6 h-6 text-green-600" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Storage</h4>
            </div>
            <StatusBadge 
              status={healthStatus.storage} 
              label={healthStatus.storage ? 'Configured' : 'Missing Buckets'} 
            />
          </div>

          {/* Settings Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Settings className="w-6 h-6 text-orange-600" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Settings</h4>
            </div>
            <StatusBadge 
              status={healthStatus.settings} 
              label={healthStatus.settings ? 'Initialized' : 'Not Found'} 
            />
          </div>

          {/* Pages Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="w-6 h-6 text-indigo-600" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Pages</h4>
            </div>
            <StatusBadge 
              status={healthStatus.pages} 
              label={healthStatus.pages ? 'Available' : 'Not Found'} 
            />
          </div>

          {/* Admin Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-6 h-6 text-red-600" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Admin User</h4>
            </div>
            <div className="space-y-2">
              <StatusBadge 
                status={healthStatus.adminExists} 
                label={healthStatus.adminExists ? 'Exists' : 'Not Found'} 
              />
              {!healthStatus.adminExists && (
                <button
                  onClick={createAdminUser}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  Create Admin User
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      {healthStatus && healthStatus.errors.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span>Issues Found</span>
          </h4>
          <ul className="space-y-2">
            {healthStatus.errors.map((error, index) => (
              <li key={index} className="flex items-start space-x-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 text-sm">{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Test Products</span>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Image className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Test Banners</span>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <FileText className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Test Pages</span>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Settings className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Test Settings</span>
          </button>
        </div>
      </div>
    </div>
  )
}