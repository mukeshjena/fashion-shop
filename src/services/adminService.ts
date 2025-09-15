import { supabase, handleSupabaseError } from '../lib/supabase'
import { executeQuery, withBatch } from './connectionService'
import type { Banner, Product, Category, Page, Setting } from '../types'

// Error handling utility
class AdminServiceError extends Error {
  public code?: string
  
  constructor(message: string, code?: string) {
    super(message)
    this.name = 'AdminServiceError'
    this.code = code
  }
}

// Cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Cache helper functions
const getCacheKey = (operation: string, params?: any) => {
  return `${operation}_${JSON.stringify(params || {})}`
}

const getFromCache = <T>(key: string): T | null => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  cache.delete(key)
  return null
}

const setCache = <T>(key: string, data: T, ttl: number = 30000) => {
  cache.set(key, { data, timestamp: Date.now(), ttl })
}

const clearCacheByPrefix = (prefix: string) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

// Generic response type
interface ServiceResponse<T> {
  data?: T
  error?: string
  success: boolean
}

// Banner Service
export class BannerService {
  static async getAll(): Promise<ServiceResponse<Banner[]>> {
    const cacheKey = getCacheKey('banners_getAll')
    
    // Check cache first
    const cached = getFromCache<Banner[]>(cacheKey)
    if (cached) {
      return { data: cached, success: true }
    }

    try {
      const result = await executeQuery<Banner[]>(
        async (client) => await client
          .from('banners')
          .select('*')
          .order('sort_order', { ascending: true })
      )

      if (result.error) {
        const errorInfo = handleSupabaseError(result.error, 'fetch banners')
        throw new AdminServiceError(errorInfo.message, errorInfo.code)
      }

      const banners = result.data || []
      setCache(cacheKey, banners, 60000) // Cache for 1 minute
      
      return { data: banners, success: true }
    } catch (error) {
      console.error('Error fetching banners:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to fetch banners',
        success: false
      }
    }
  }

  static async create(bannerData: Omit<Banner, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Banner>> {
    try {
      // Validate required fields
      if (!bannerData.title?.trim()) {
        throw new AdminServiceError('Banner title is required')
      }
      if (!bannerData.image_url?.trim()) {
        throw new AdminServiceError('Banner image is required')
      }

      const result = await withBatch(async () => {
        return executeQuery<Banner>(
          async (client) => await client
            .from('banners')
            .insert([bannerData])
            .select()
            .single()
        )
      })

      if (result.error) {
        const errorInfo = handleSupabaseError(result.error, 'create banner')
        throw new AdminServiceError(errorInfo.message, errorInfo.code)
      }

      // Clear cache after successful creation
      clearCacheByPrefix('banners_')
      
      return { data: result.data!, success: true }
    } catch (error) {
      console.error('Error creating banner:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to create banner',
        success: false
      }
    }
  }

  static async update(id: string, bannerData: Partial<Banner>): Promise<ServiceResponse<Banner>> {
    try {
      if (!id) throw new AdminServiceError('Banner ID is required')

      const { data, error } = await supabase
        .from('banners')
        .update({ ...bannerData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        const errorInfo = handleSupabaseError(error, 'update banner')
        throw new AdminServiceError(errorInfo.message, errorInfo.code)
      }

      // Clear cache after successful update
      clearCacheByPrefix('banners_')
      
      return { data, success: true }
    } catch (error) {
      console.error('Error updating banner:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to update banner',
        success: false
      }
    }
  }

  static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      if (!id) throw new AdminServiceError('Banner ID is required')

      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)

      if (error) {
        const errorInfo = handleSupabaseError(error, 'delete banner')
        throw new AdminServiceError(errorInfo.message, errorInfo.code)
      }

      // Clear cache after successful deletion
      clearCacheByPrefix('banners_')
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting banner:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to delete banner',
        success: false
      }
    }
  }

  static async toggleStatus(id: string, isActive: boolean): Promise<ServiceResponse<Banner>> {
    try {
      if (!id) throw new AdminServiceError('Banner ID is required')

      const { data, error } = await supabase
        .from('banners')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        const errorInfo = handleSupabaseError(error, 'toggle banner status')
        throw new AdminServiceError(errorInfo.message, errorInfo.code)
      }

      // Clear cache after successful status change
      clearCacheByPrefix('banners_')
      
      return { data, success: true }
    } catch (error) {
      console.error('Error toggling banner status:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to update banner status',
        success: false
      }
    }
  }
}

// Product Service
export class ProductService {
  static async getAll(filters?: { category?: string; search?: string; featured?: boolean }): Promise<ServiceResponse<Product[]>> {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .order('sort_order', { ascending: true })

      if (filters?.category) {
        query = query.eq('category_id', filters.category)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured)
      }

      const { data, error } = await query

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data: data || [], success: true }
    } catch (error) {
      console.error('Error fetching products:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to fetch products',
        success: false
      }
    }
  }

  static async create(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Product>> {
    try {
      // Validate required fields
      if (!productData.name?.trim()) {
        throw new AdminServiceError('Product name is required')
      }
      if (!productData.slug?.trim()) {
        throw new AdminServiceError('Product slug is required')
      }
      if (!productData.price || productData.price <= 0) {
        throw new AdminServiceError('Valid product price is required')
      }
      if (!productData.category_id?.trim()) {
        throw new AdminServiceError('Product category is required')
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select(`
          *,
          category:categories(id, name, slug)
        `)
        .single()

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data, success: true }
    } catch (error) {
      console.error('Error creating product:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to create product',
        success: false
      }
    }
  }

  static async update(id: string, productData: Partial<Product>): Promise<ServiceResponse<Product>> {
    try {
      if (!id) throw new AdminServiceError('Product ID is required')

      const { data, error } = await supabase
        .from('products')
        .update({ ...productData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data, success: true }
    } catch (error) {
      console.error('Error updating product:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to update product',
        success: false
      }
    }
  }

  static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      if (!id) throw new AdminServiceError('Product ID is required')

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw new AdminServiceError(error.message, error.code)

      return { success: true }
    } catch (error) {
      console.error('Error deleting product:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to delete product',
        success: false
      }
    }
  }
}

// Category Service
export class CategoryService {
  static async getAll(): Promise<ServiceResponse<Category[]>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data: data || [], success: true }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to fetch categories',
        success: false
      }
    }
  }

  static async create(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Category>> {
    try {
      // Validate required fields
      if (!categoryData.name?.trim()) {
        throw new AdminServiceError('Category name is required')
      }
      if (!categoryData.slug?.trim()) {
        throw new AdminServiceError('Category slug is required')
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single()

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data, success: true }
    } catch (error) {
      console.error('Error creating category:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to create category',
        success: false
      }
    }
  }

  static async update(id: string, categoryData: Partial<Category>): Promise<ServiceResponse<Category>> {
    try {
      if (!id) throw new AdminServiceError('Category ID is required')

      const { data, error } = await supabase
        .from('categories')
        .update({ ...categoryData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data, success: true }
    } catch (error) {
      console.error('Error updating category:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to update category',
        success: false
      }
    }
  }

  static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      if (!id) throw new AdminServiceError('Category ID is required')

      // Check if category has products
      const { data: products, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('category_id', id)
        .limit(1)

      if (checkError) throw new AdminServiceError(checkError.message, checkError.code)

      if (products && products.length > 0) {
        throw new AdminServiceError('Cannot delete category that has products. Please move or delete products first.')
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw new AdminServiceError(error.message, error.code)

      return { success: true }
    } catch (error) {
      console.error('Error deleting category:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to delete category',
        success: false
      }
    }
  }
}

// Page Service
export class PageService {
  static async getAll(): Promise<ServiceResponse<Page[]>> {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data: data || [], success: true }
    } catch (error) {
      console.error('Error fetching pages:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to fetch pages',
        success: false
      }
    }
  }

  static async create(pageData: Omit<Page, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Page>> {
    try {
      // Validate required fields
      if (!pageData.title?.trim()) {
        throw new AdminServiceError('Page title is required')
      }
      if (!pageData.slug?.trim()) {
        throw new AdminServiceError('Page slug is required')
      }
      if (!pageData.content?.trim()) {
        throw new AdminServiceError('Page content is required')
      }

      const { data, error } = await supabase
        .from('pages')
        .insert([pageData])
        .select()
        .single()

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data, success: true }
    } catch (error) {
      console.error('Error creating page:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to create page',
        success: false
      }
    }
  }

  static async update(id: string, pageData: Partial<Page>): Promise<ServiceResponse<Page>> {
    try {
      if (!id) throw new AdminServiceError('Page ID is required')

      const { data, error } = await supabase
        .from('pages')
        .update({ ...pageData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data, success: true }
    } catch (error) {
      console.error('Error updating page:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to update page',
        success: false
      }
    }
  }

  static async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      if (!id) throw new AdminServiceError('Page ID is required')

      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id)

      if (error) throw new AdminServiceError(error.message, error.code)

      return { success: true }
    } catch (error) {
      console.error('Error deleting page:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to delete page',
        success: false
      }
    }
  }
}

// Settings Service
export class SettingsService {
  static async getAll(): Promise<ServiceResponse<Setting[]>> {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('key', { ascending: true })

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data: data || [], success: true }
    } catch (error) {
      console.error('Error fetching settings:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to fetch settings',
        success: false
      }
    }
  }

  static async update(key: string, value: string): Promise<ServiceResponse<Setting>> {
    try {
      if (!key?.trim()) throw new AdminServiceError('Setting key is required')
      if (value === undefined || value === null) throw new AdminServiceError('Setting value is required')

      const { data, error } = await supabase
        .from('settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, {
          onConflict: 'key',
          ignoreDuplicates: false
        })
        .select()
        .single()

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data, success: true }
    } catch (error) {
      console.error('Error updating setting:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to update setting',
        success: false
      }
    }
  }

  static async updateMultiple(settings: { key: string; value: string }[]): Promise<ServiceResponse<Setting[]>> {
    try {
      if (!settings || settings.length === 0) {
        throw new AdminServiceError('Settings data is required')
      }

      const settingsWithTimestamp = settings.map(setting => ({
        ...setting,
        updated_at: new Date().toISOString()
      }))

      const { data, error } = await supabase
        .from('settings')
        .upsert(settingsWithTimestamp, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        })
        .select()

      if (error) throw new AdminServiceError(error.message, error.code)

      return { data: data || [], success: true }
    } catch (error) {
      console.error('Error updating settings:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to update settings',
        success: false
      }
    }
  }
}

// File Upload Service
export class FileUploadService {
  static async uploadImage(file: File, bucket: string = 'products'): Promise<ServiceResponse<string>> {
    try {
      console.log(`📤 Starting image upload to bucket: ${bucket}`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })
      
      if (!file) throw new AdminServiceError('File is required')
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new AdminServiceError('Only image files are allowed')
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new AdminServiceError('File size must be less than 5MB')
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`
      console.log(`📁 Generated filename: ${fileName}`)
      
      console.log(`🔄 Uploading to Supabase storage...`)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (uploadError) {
        console.error(`❌ Upload failed:`, uploadError)
        throw new AdminServiceError(`Upload failed: ${uploadError.message}`)
      }

      console.log(`✅ Upload successful:`, uploadData)
      
      console.log(`🔗 Getting public URL...`)
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      console.log(`🌐 Public URL generated: ${publicUrl}`)
      
      // Validate URL format and accessibility
      if (!publicUrl || !publicUrl.includes('supabase')) {
        console.error(`❌ Invalid public URL generated: ${publicUrl}`)
        throw new AdminServiceError('Failed to generate valid public URL')
      }
      
      // Test URL accessibility
      try {
        const testResponse = await fetch(publicUrl, { method: 'HEAD' })
        if (!testResponse.ok) {
          console.warn(`⚠️ URL may not be publicly accessible: ${testResponse.status}`)
          console.warn(`💡 Check bucket policies for public read access`)
        } else {
          console.log(`✅ URL accessibility verified`)
        }
      } catch (urlTestError) {
        console.warn(`⚠️ Could not test URL accessibility:`, urlTestError)
        console.warn(`💡 This may be due to CORS or network issues`)
      }
      
      return { data: publicUrl, success: true }
    } catch (error) {
      console.error('❌ Image upload error:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to upload image',
        success: false
      }
    }
  }

  static async uploadVideo(file: File, bucket: string = 'products'): Promise<ServiceResponse<string>> {
    try {
      if (!file) throw new AdminServiceError('File is required')
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        throw new AdminServiceError('Only video files are allowed')
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new AdminServiceError('Video file size must be less than 50MB')
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file)

      if (uploadError) throw new AdminServiceError(uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

      return { data: publicUrl, success: true }
    } catch (error) {
      console.error('Error uploading video:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to upload video',
        success: false
      }
    }
  }

  static async deleteFile(url: string, bucket: string = 'products'): Promise<ServiceResponse<void>> {
    try {
      if (!url) throw new AdminServiceError('File URL is required')

      // Extract filename from URL
      const urlParts = url.split('/')
      const fileName = urlParts[urlParts.length - 1]

      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName])

      if (error) throw new AdminServiceError(error.message)

      return { success: true }
    } catch (error) {
      console.error('Error deleting file:', error)
      return {
        error: error instanceof AdminServiceError ? error.message : 'Failed to delete file',
        success: false
      }
    }
  }
}

// Export all services
export const adminServices = {
  banners: BannerService,
  products: ProductService,
  categories: CategoryService,
  pages: PageService,
  settings: SettingsService,
  files: FileUploadService
}

export default adminServices