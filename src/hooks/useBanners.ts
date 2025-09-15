import { useCallback } from 'react'
import { useSupabaseQuery } from './useOptimizedQuery'
import type { Banner } from '../types'

interface UseBannersReturn {
  banners: Banner[]
  loading: boolean
  error: string | null
  fetchBanners: () => Promise<void>
  isStale: boolean
}

export default function useBanners(): UseBannersReturn {
  const queryBuilder = useCallback((query: any) => {
    return query
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
  }, [])

  const {
    data: banners,
    loading,
    error,
    refetch: fetchBanners,
    isStale
  } = useSupabaseQuery<Banner[]>('banners', queryBuilder, {
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
    retryCount: 3,
    retryDelay: 1000,
    refetchOnWindowFocus: true
  })

  return {
    banners: banners || [],
    loading,
    error,
    fetchBanners,
    isStale
  }
}