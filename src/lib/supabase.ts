import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  })
  throw new Error('Missing Supabase environment variables')
}

// Connection pool management
class SupabaseConnectionManager {
  private static instance: SupabaseConnectionManager
  private client: SupabaseClient | null = null
  private connectionCount = 0
  private lastActivity = Date.now()
  private healthCheckInterval: NodeJS.Timeout | null = null
  private isConnected = false
  private currentSession: any = null
  private authSubscription: any = null

  private constructor() {
    this.initializeClient()
    this.setupAuthListener()
    this.startHealthCheck()
  }

  public static getInstance(): SupabaseConnectionManager {
    if (!SupabaseConnectionManager.instance) {
      SupabaseConnectionManager.instance = new SupabaseConnectionManager()
      console.log('🔧 Created new SupabaseConnectionManager instance')
    } else {
      console.log('♻️ Reusing existing SupabaseConnectionManager instance')
    }
    return SupabaseConnectionManager.instance
  }

  public static resetInstance(): void {
    if (SupabaseConnectionManager.instance) {
      SupabaseConnectionManager.instance.disconnect()
      SupabaseConnectionManager.instance = null as any
      console.log('🗑️ Reset SupabaseConnectionManager instance')
    }
  }

  private initializeClient(): void {
    if (this.client) {
      return // Client already exists, reuse it
    }

    console.log('🔌 Initializing Supabase connection...')
    
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: false,
        storageKey: 'fashion-shop-auth-token' // Static key for session persistence
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-client-info': 'fashion-shop-v1.0',
          'x-connection-id': `conn-${Date.now()}`
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })

    // Attempt initial session recovery asynchronously
    this.recoverInitialSession()

    this.isConnected = true
    console.log('✅ Supabase connection established')
  }

  private async recoverInitialSession(): Promise<void> {
    try {
      if (!this.client) return
      
      const { data: { session }, error } = await this.client.auth.getSession()
      if (session && !error) {
        this.currentSession = session
        console.log('🔄 Restored session for:', session.user?.email)
      } else if (error) {
        console.warn('⚠️ Session recovery error:', error)
      } else {
        console.log('📝 No existing session found')
      }
    } catch (error) {
      console.warn('⚠️ Session recovery failed:', error)
    }
  }

  private startHealthCheck(): void {
    // Periodic health check every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck()
    }, 30000)
  }

  private async performHealthCheck(): Promise<void> {
    try {
      if (!this.client) {
        this.initializeClient()
        return
      }

      // Simple health check query
      const { error } = await this.client
        .from('settings')
        .select('key')
        .limit(1)

      if (error) {
        console.warn('⚠️ Health check failed:', error.message)
        
        // Check if it's an authentication error
        if (error.message?.includes('JWT') || error.message?.includes('auth') || error.code === 'PGRST301') {
          console.log('🔄 Authentication error detected, refreshing session...')
          await this.handleAuthError()
        } else {
          this.isConnected = false
        }
      } else {
        this.isConnected = true
        this.updateActivity()
      }
    } catch (error) {
      console.warn('⚠️ Health check error:', error)
      
      // Check if it's a network or auth error
      if (error instanceof Error && (error.message.includes('JWT') || error.message.includes('auth'))) {
        await this.handleAuthError()
      } else {
        this.isConnected = false
      }
    }
  }

  private updateActivity(): void {
    this.lastActivity = Date.now()
  }

  public getClient(): SupabaseClient {
    if (!this.client || !this.isConnected) {
      this.initializeClient()
    }
    
    this.connectionCount++
    this.updateActivity()
    
    console.log(`📊 Connection reused (count: ${this.connectionCount})`)
    return this.client!
  }

  public getConnectionStats() {
    return {
      connectionCount: this.connectionCount,
      lastActivity: this.lastActivity,
      isConnected: this.isConnected,
      uptime: Date.now() - this.lastActivity
    }
  }

  private setupAuthListener(): void {
    if (!this.client) return

    // Listen for auth state changes and update session
    const { data: { subscription } } = this.client.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔐 Auth state changed: ${event}`, session?.user?.email || 'No user')
      
      // Handle session changes without refreshing client to avoid recursion
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        this.currentSession = session
        console.log('✅ Session updated successfully')
        this.isConnected = true
      } else if (event === 'SIGNED_OUT') {
        this.currentSession = null
        console.log('🚪 User signed out')
        this.isConnected = true // Keep connection for anonymous access
      } else if (event === 'INITIAL_SESSION') {
        // Handle initial session on page load
        if (session) {
          this.currentSession = session
          console.log('🔄 Initial session restored:', session.user?.email)
        }
        this.isConnected = true
      }
      
      this.updateActivity()
    })
    
    this.authSubscription = subscription
  }

  // @ts-ignore - Method kept for future use
  private async refreshClient(): Promise<void> {
    try {
      console.log('🔄 Refreshing Supabase client...')
      
      // Clean up old subscription first
      if (this.authSubscription && typeof this.authSubscription.unsubscribe === 'function') {
        this.authSubscription.unsubscribe()
        this.authSubscription = null
      }
      
      // Create a fresh client instance
      const newClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          debug: false
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-client-info': 'fashion-shop-v1.0',
            'x-connection-id': `conn-${Date.now()}`
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      })

      // Replace the old client
      this.client = newClient
      
      // Set up new auth listener
      this.setupAuthListener()
      
      this.isConnected = true
      console.log('✅ Client refreshed successfully')
    } catch (error) {
      console.error('❌ Failed to refresh client:', error)
      this.isConnected = false
    }
  }

  private async handleAuthError(): Promise<void> {
    try {
      console.log('🔧 Handling authentication error...')
      
      // Try to refresh the current session
      if (this.client && this.currentSession?.refresh_token) {
        const { data, error } = await this.client.auth.refreshSession({
          refresh_token: this.currentSession.refresh_token
        })
        
        if (error || !data.session) {
          console.log('🔄 Session refresh failed, clearing session...')
          this.currentSession = null
          this.isConnected = true // Keep connection for anonymous access
        } else {
          console.log('✅ Session refreshed successfully')
          this.currentSession = data.session
          this.isConnected = true
        }
      } else {
        // No session to refresh, just mark as connected for anonymous access
        console.log('🔄 No session to refresh, using anonymous access')
        this.currentSession = null
        this.isConnected = true
      }
    } catch (error) {
      console.error('❌ Auth error handling failed:', error)
      this.currentSession = null
      this.isConnected = true // Keep connection for anonymous access
    }
  }

  public async disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    
    if (this.authSubscription && typeof this.authSubscription.unsubscribe === 'function') {
      this.authSubscription.unsubscribe()
    }
    
    if (this.client) {
      // Gracefully close any open connections
      await this.client.auth.signOut()
      this.client = null
    }
    
    this.currentSession = null
    this.isConnected = false
    console.log('🔌 Supabase connection closed')
  }
}

// Global singleton instance with HMR protection
let connectionManager: SupabaseConnectionManager

// Prevent multiple instances during development HMR
if (typeof window !== 'undefined') {
  if (!(window as any).__supabaseConnectionManager) {
    (window as any).__supabaseConnectionManager = SupabaseConnectionManager.getInstance()
  }
  connectionManager = (window as any).__supabaseConnectionManager
} else {
  connectionManager = SupabaseConnectionManager.getInstance()
}

// Export the managed client
export const supabase = connectionManager.getClient()

// Export connection utilities
export const getConnectionStats = () => connectionManager.getConnectionStats()
export const disconnectSupabase = () => connectionManager.disconnect()

// Connection health check with proper error handling
export const checkSupabaseConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  try {
    // Use a simple query that works for both authenticated and anonymous users
    const { error } = await supabase
      .from('settings')
      .select('key')
      .limit(1)

    if (error) {
      // Don't treat auth errors as connection failures
      if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('auth')) {
        console.log('🔐 Auth-related query result (connection is working)')
        return { connected: true }
      }
      
      console.error('Supabase connection error:', error)
      return { connected: false, error: error.message }
    }

    return { connected: true }
  } catch (error) {
    console.error('Supabase connection failed:', error)
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    }
  }
}

// Enhanced error handler for Supabase operations
export const handleSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error)
  
  // Common error messages
  const errorMessages: Record<string, string> = {
    'PGRST116': 'Record not found',
    'PGRST301': 'Row Level Security policy violation',
    '23505': 'Duplicate entry - record already exists',
    '23503': 'Referenced record does not exist',
    '42501': 'Insufficient permissions',
    'JWT_EXPIRED': 'Session expired - please login again',
    'INVALID_CREDENTIALS': 'Invalid email or password'
  }

  const code = error?.code || error?.error_description || ''
  const message = errorMessages[code] || error?.message || 'An unexpected error occurred'
  
  return {
    code,
    message,
    details: error
  }
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price: number
          category_id: string
          images: string[]
          videos: string[]
          is_featured: boolean
          is_active: boolean
          sort_order: number
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price: number
          category_id: string
          images?: string[]
          videos?: string[]
          is_featured?: boolean
          is_active?: boolean
          sort_order?: number
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price?: number
          category_id?: string
          images?: string[]
          videos?: string[]
          is_featured?: boolean
          is_active?: boolean
          sort_order?: number
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      banners: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          image_url: string
          video_url: string | null
          link_url: string | null
          button_text: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          image_url: string
          video_url?: string | null
          link_url?: string | null
          button_text?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          image_url?: string
          video_url?: string | null
          link_url?: string | null
          button_text?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          content: string
          meta_title: string | null
          meta_description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          content: string
          meta_title?: string | null
          meta_description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          content?: string
          meta_title?: string | null
          meta_description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}