import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase, handleSupabaseError } from '../lib/supabase'

interface QueryOptions {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  refetchInterval?: number
  retryCount?: number
  retryDelay?: number
  cacheTime?: number
  staleTime?: number
}

interface QueryResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isStale: boolean
}

// Simple cache implementation
const queryCache = new Map<string, {
  data: any
  timestamp: number
  staleTime: number
  cacheTime: number
}>()

// Cleanup stale cache entries
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > value.cacheTime) {
      queryCache.delete(key)
    }
  }
}, 60000) // Cleanup every minute

export function useOptimizedQuery<T>(
  queryKey: string,
  queryFn: () => Promise<{ data?: T; error?: any }>,
  options: QueryOptions = {}
): QueryResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval,
    retryCount = 3,
    retryDelay = 1000,
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000 // 30 seconds
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isStale, setIsStale] = useState(false)
  
  const retryCountRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Check if we have cached data
  const getCachedData = useCallback(() => {
    const cached = queryCache.get(queryKey)
    if (cached) {
      const now = Date.now()
      const isStale = now - cached.timestamp > cached.staleTime
      return { data: cached.data, isStale }
    }
    return null
  }, [queryKey])

  // Set cached data
  const setCachedData = useCallback((newData: T) => {
    queryCache.set(queryKey, {
      data: newData,
      timestamp: Date.now(),
      staleTime,
      cacheTime
    })
  }, [queryKey, staleTime, cacheTime])

  // Execute query with retry logic
  const executeQuery = useCallback(async (isRetry = false) => {
    if (!enabled) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      if (!isRetry) {
        setLoading(true)
        setError(null)
        retryCountRef.current = 0
      }

      const result = await queryFn()

      if (result.error) {
        throw result.error
      }

      if (result.data !== undefined) {
        setData(result.data)
        setCachedData(result.data)
        setIsStale(false)
        retryCountRef.current = 0
      }
    } catch (err: any) {
      // Don't handle aborted requests
      if (err.name === 'AbortError') {
        return
      }

      console.error(`Query error for ${queryKey}:`, err)
      
      const errorInfo = handleSupabaseError(err, `query ${queryKey}`)
      
      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++
        console.log(`Retrying query ${queryKey} (${retryCountRef.current}/${retryCount})...`)
        
        setTimeout(() => {
          executeQuery(true)
        }, retryDelay * retryCountRef.current) // Exponential backoff
        
        return
      }

      setError(errorInfo.message)
    } finally {
      if (!isRetry) {
        setLoading(false)
      }
    }
  }, [enabled, queryFn, queryKey, retryCount, retryDelay, setCachedData])

  // Refetch function
  const refetch = useCallback(async () => {
    await executeQuery()
  }, [executeQuery])

  // Initial data load
  useEffect(() => {
    if (!enabled) return

    // Check for cached data first
    const cached = getCachedData()
    if (cached) {
      setData(cached.data)
      setIsStale(cached.isStale)
      
      // If data is stale, refetch in background
      if (cached.isStale) {
        executeQuery()
      }
    } else {
      executeQuery()
    }
  }, [enabled, queryKey, getCachedData, executeQuery])

  // Refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        executeQuery()
      }, refetchInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [refetchInterval, enabled, executeQuery])

  // Refetch on window focus
  useEffect(() => {
    if (refetchOnWindowFocus && enabled) {
      const handleFocus = () => {
        const cached = getCachedData()
        if (!cached || cached.isStale) {
          executeQuery()
        }
      }

      window.addEventListener('focus', handleFocus)
      return () => window.removeEventListener('focus', handleFocus)
    }
  }, [refetchOnWindowFocus, enabled, getCachedData, executeQuery])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    isStale
  }
}

// Specialized hook for Supabase queries
export function useSupabaseQuery<T>(
  table: string,
  queryBuilder: (query: any) => any,
  options: QueryOptions = {}
): QueryResult<T> {
  const queryKey = `supabase_${table}_${JSON.stringify(queryBuilder.toString())}`
  
  const queryFn = useCallback(async () => {
    try {
      const query = supabase.from(table)
      const builtQuery = queryBuilder(query)
      const { data, error } = await builtQuery
      
      return { data, error }
    } catch (error) {
      return { error }
    }
  }, [table, queryBuilder])

  return useOptimizedQuery<T>(queryKey, queryFn, options)
}

// Clear cache for specific keys or patterns
export const clearQueryCache = (pattern?: string) => {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key)
      }
    }
  } else {
    queryCache.clear()
  }
}

// Get cache statistics
export const getCacheStats = () => {
  const now = Date.now()
  let totalEntries = 0
  let staleEntries = 0
  let expiredEntries = 0

  for (const [, value] of queryCache.entries()) {
    totalEntries++
    if (now - value.timestamp > value.staleTime) {
      staleEntries++
    }
    if (now - value.timestamp > value.cacheTime) {
      expiredEntries++
    }
  }

  return {
    totalEntries,
    staleEntries,
    expiredEntries,
    cacheSize: queryCache.size
  }
}