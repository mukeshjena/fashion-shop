import { useState, useEffect } from 'react'
import { WifiOff, AlertTriangle, CheckCircle, RefreshCw, Database, Activity } from 'lucide-react'
import { checkSupabaseConnection, getConnectionStats } from '../../lib/supabase'

interface ConnectionStatus {
  online: boolean
  supabaseConnected: boolean
  lastChecked: Date
  error?: string
  connectionStats?: {
    connectionCount: number
    lastActivity: number
    isConnected: boolean
    uptime: number
  }
}

export default function ConnectionMonitor() {
  const [status, setStatus] = useState<ConnectionStatus>({
    online: navigator.onLine,
    supabaseConnected: false,
    lastChecked: new Date()
  })
  const [isChecking, setIsChecking] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const supabaseStatus = await checkSupabaseConnection()
      const connectionStats = getConnectionStats()
      
      setStatus({
        online: navigator.onLine,
        supabaseConnected: supabaseStatus.connected,
        lastChecked: new Date(),
        error: supabaseStatus.error,
        connectionStats
      })
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        supabaseConnected: false,
        lastChecked: new Date(),
        error: 'Connection check failed'
      }))
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Initial check
    checkConnection()

    // Set up periodic checks
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, online: true }))
      checkConnection()
    }

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, online: false, supabaseConnected: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getStatusColor = () => {
    if (!status.online) return 'text-red-500'
    if (!status.supabaseConnected) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStatusIcon = () => {
    if (!status.online) return <WifiOff className="w-4 h-4" />
    if (!status.supabaseConnected) return <AlertTriangle className="w-4 h-4" />
    return <CheckCircle className="w-4 h-4" />
  }

  const getStatusText = () => {
    if (!status.online) return 'Offline'
    if (!status.supabaseConnected) return 'Database Disconnected'
    return 'Connected'
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer transition-all duration-200 hover:shadow-xl ${
          showDetails ? 'w-80' : 'w-auto'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center space-x-2">
          <div className={getStatusColor()}>
            {isChecking ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              getStatusIcon()
            )}
          </div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          {showDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                checkConnection()
              }}
              className="ml-auto p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              disabled={isChecking}
            >
              <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {showDetails && (
          <div className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Internet:</span>
              <span className={status.online ? 'text-green-600' : 'text-red-600'}>
                {status.online ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Database:</span>
              <span className={status.supabaseConnected ? 'text-green-600' : 'text-red-600'}>
                {status.supabaseConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Check:</span>
              <span>{status.lastChecked.toLocaleTimeString()}</span>
            </div>
            
            {/* Connection Statistics */}
            {status.connectionStats && (
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-1 text-blue-700 dark:text-blue-300 font-medium mb-1">
                  <Database className="w-3 h-3" />
                  <span>Connection Pool</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Reused:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {status.connectionStats.connectionCount} times
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={status.connectionStats.isConnected ? 'text-green-600' : 'text-red-600'}>
                      {status.connectionStats.isConnected ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Activity:</span>
                    <span>{new Date(status.connectionStats.lastActivity).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            )}
            
            {status.error && (
              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300">
                <div className="font-medium">Error:</div>
                <div className="text-xs">{status.error}</div>
              </div>
            )}
            
            {status.supabaseConnected && status.connectionStats && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-green-700 dark:text-green-300">
                <div className="flex items-center space-x-1 font-medium mb-1">
                  <Activity className="w-3 h-3" />
                  <span>Optimized Connection</span>
                </div>
                <div className="text-xs">
                  ✅ Single connection reused {status.connectionStats.connectionCount} times<br/>
                  ✅ Connection pooling active<br/>
                  ✅ Automatic health monitoring
                </div>
              </div>
            )}
            
            {!status.supabaseConnected && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-yellow-700 dark:text-yellow-300">
                <div className="font-medium">Troubleshooting:</div>
                <ul className="text-xs mt-1 space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Verify Supabase credentials</li>
                  <li>• Check if Supabase is down</li>
                  <li>• Try refreshing the page</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}