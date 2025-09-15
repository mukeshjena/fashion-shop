export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  category_id: string
  category?: Category
  images: string[]
  videos: string[]
  is_featured: boolean
  is_active: boolean
  sort_order: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  video_url?: string
  link_url?: string
  button_text?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Page {
  id: string
  slug: string
  title: string
  content: string
  meta_title?: string
  meta_description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value: string
  created_at: string
  updated_at: string
}

export interface WhatsAppSettings {
  phone_number: string
  message_template: string
  is_active: boolean
}

export interface SEOSettings {
  site_title: string
  site_description: string
  site_keywords: string
  og_image: string
}

export interface SiteSettings {
  site_name: string
  site_logo: string
  site_favicon: string
  contact_email: string
  contact_phone: string
  social_links: {
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
  }
}

export interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  sortBy?: 'name' | 'price' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
  error?: string
}

export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface FormState<T> extends LoadingState {
  data: T
  isDirty: boolean
  isValid: boolean
  errors: Record<string, string>
}

export interface UploadProgress {
  progress: number
  isUploading: boolean
  error?: string
}

export interface ThreeJSScene {
  camera: any
  scene: any
  renderer: any
  controls?: any
}

export interface AnimationConfig {
  duration: number
  delay?: number
  ease?: string
  repeat?: number
  yoyo?: boolean
}

export interface ParallaxConfig {
  speed: number
  direction: 'vertical' | 'horizontal'
  trigger?: string
}