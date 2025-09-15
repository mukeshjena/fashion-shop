import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'

// Mock data for fallback when database is unavailable
const getMockCategories = (): Category[] => {
  return [
    {
      id: 'mock-cat-1',
      name: 'Shirts',
      slug: 'shirts',
      description: 'Premium shirts collection for all occasions',
      image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
      is_active: true,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-cat-2',
      name: 'Dresses',
      slug: 'dresses',
      description: 'Elegant dresses for special occasions',
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      is_active: true,
      sort_order: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-cat-3',
      name: 'Jeans',
      slug: 'jeans',
      description: 'High-quality denim for everyday wear',
      image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      is_active: true,
      sort_order: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-cat-4',
      name: 'Accessories',
      slug: 'accessories',
      description: 'Complete your look with our accessories',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
      is_active: true,
      sort_order: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

interface UseCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  fetchCategoryBySlug: (slug: string) => Promise<Category | null>
}

export default function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auto-fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      // Increased timeout to 5 seconds for better reliability
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      })

      const queryPromise = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      const { data, error: fetchError } = await Promise.race([queryPromise, timeoutPromise])

      if (fetchError) {
        throw fetchError
      }

      // If no data from database, use mock data
      if (!data || data.length === 0) {
        console.warn('No categories found in database, using mock data')
        setCategories(getMockCategories())
      } else {
        setCategories(data)
      }
    } catch (err) {
      console.error('Database error, using mock categories:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      // Fallback to mock data on error
      setCategories(getMockCategories())
    } finally {
      setLoading(false)
    }
  }

  const fetchCategoryBySlug = async (slug: string): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error('Error fetching category by slug:', err)
      return null
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    fetchCategoryBySlug
  }
}