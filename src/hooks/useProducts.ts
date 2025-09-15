import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Product, ProductFilters, PaginationMeta } from '../types'

// Mock data for fallback when database is unavailable
const getMockProducts = (limit: number = 8): Product[] => {
  const mockProducts: Product[] = [
    {
      id: 'mock-1',
      name: 'Classic White Shirt',
      slug: 'classic-white-shirt',
      description: 'A timeless white shirt perfect for any occasion.',
      price: 89.99,
      category_id: 'mock-cat-1',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'],
      videos: [],
      is_featured: true,
      is_active: true,
      sort_order: 1,
      meta_title: 'Classic White Shirt',
      meta_description: 'Premium white shirt for professional and casual wear',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: {
        id: 'mock-cat-1',
        name: 'Shirts',
        slug: 'shirts',
        description: 'Premium shirts collection',
        image_url: undefined,
        is_active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    },
    {
      id: 'mock-2',
      name: 'Elegant Black Dress',
      slug: 'elegant-black-dress',
      description: 'Sophisticated black dress for special occasions.',
      price: 159.99,
      category_id: 'mock-cat-2',
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
      videos: [],
      is_featured: true,
      is_active: true,
      sort_order: 2,
      meta_title: 'Elegant Black Dress',
      meta_description: 'Premium black dress for elegant occasions',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: {
         id: 'mock-cat-2',
         name: 'Dresses',
         slug: 'dresses',
         description: 'Elegant dresses collection',
         image_url: undefined,
         is_active: true,
         sort_order: 2,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       }
    },
    {
      id: 'mock-3',
      name: 'Casual Denim Jeans',
      slug: 'casual-denim-jeans',
      description: 'Comfortable denim jeans for everyday wear.',
      price: 79.99,
      category_id: 'mock-cat-3',
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'],
      videos: [],
      is_featured: true,
      is_active: true,
      sort_order: 3,
      meta_title: 'Casual Denim Jeans',
      meta_description: 'High-quality denim jeans for casual wear',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: {
         id: 'mock-cat-3',
         name: 'Jeans',
         slug: 'jeans',
         description: 'Premium denim collection',
         image_url: undefined,
         is_active: true,
         sort_order: 3,
         created_at: new Date().toISOString(),
         updated_at: new Date().toISOString()
       }
    }
  ]
  
  return mockProducts.slice(0, limit)
}

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  meta: PaginationMeta | null
  fetchProducts: (filters?: ProductFilters, page?: number, limit?: number, includeInactive?: boolean) => Promise<void>
  fetchProductBySlug: (slug: string) => Promise<Product | null>
  fetchFeaturedProducts: (limit?: number) => Promise<Product[]>
  searchProducts: (searchTerm: string) => Promise<void>
  fetchProductsByCategory: (categoryId: string, limit?: number) => Promise<Product[]>
}

export default function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<PaginationMeta | null>(null)

  const fetchProducts = async (
    filters: ProductFilters = {},
    page = 1,
    limit = 12,
    includeInactive = false
  ) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `, { count: 'exact' })
      
      // Only filter by is_active if not including inactive products (for admin)
      if (!includeInactive) {
        query = query.eq('is_active', true)
      }

      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice)
      }

      if (filters.featured !== undefined) {
        query = query.eq('is_featured', filters.featured)
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'sort_order'
      const sortOrder = filters.sortOrder || 'asc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      const { data, error: fetchError, count } = await query

      if (fetchError) {
        throw fetchError
      }

      // If no data from database, use mock data
      if (!data || data.length === 0) {
        console.warn('No products found in database, using mock data')
        const mockData = getMockProducts(limit)
        setProducts(mockData)
        setMeta({
          page,
          limit,
          total: mockData.length,
          totalPages: Math.ceil(mockData.length / limit)
        })
      } else {
        setProducts(data)
        
        if (count !== null) {
          setMeta({
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
          })
        }
      }
    } catch (err) {
      console.error('Database error, using mock data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      // Fallback to mock data on error
      const mockData = getMockProducts(limit)
      setProducts(mockData)
      setMeta({
        page,
        limit,
        total: mockData.length,
        totalPages: Math.ceil(mockData.length / limit)
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (err) {
      console.error('Error fetching product by slug:', err)
      return null
    }
  }

  const fetchFeaturedProducts = async (limit = 8): Promise<Product[]> => {
    try {
      // Increased timeout to 5 seconds for better reliability
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      })

      const queryPromise = supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })
        .limit(limit)

      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error) {
        console.error('Error fetching featured products:', error)
        // Return mock data if database fails
        return getMockProducts(limit)
      }

      // If no data, return mock data
      if (!data || data.length === 0) {
        console.warn('No featured products found, returning mock data')
        return getMockProducts(limit)
      }

      return data
    } catch (err) {
      console.error('Error fetching featured products, using mock data:', err)
      return getMockProducts(limit)
    }
  }

  const searchProducts = async (searchTerm: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products')
    } finally {
      setLoading(false)
    }
  }

  const fetchProductsByCategory = async (categoryId: string, limit = 4): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .limit(limit)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching products by category:', err)
      return []
    }
  }

  return {
    products,
    loading,
    error,
    meta,
    fetchProducts,
    fetchProductBySlug,
    fetchFeaturedProducts,
    searchProducts,
    fetchProductsByCategory
  }
}