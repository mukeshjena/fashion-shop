import { useState, useEffect, createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { supabase, handleSupabaseError } from '../lib/supabase'
import type { User as AppUser } from '../types'

type Session = any

interface AuthContextType {
  user: AppUser | null
  session: Session | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    let mounted = true
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...')
        setLoading(true)
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (error) {
          console.error('❌ Session error:', error)
          setSession(null)
          setUser(null)
          setLoading(false)
          setInitialized(true)
          return
        }

        if (session?.user) {
          console.log('✅ Session found:', session.user.email)
          setSession(session)
          
          // Fetch user profile
          try {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (!mounted) return

            if (userError) {
              console.warn('⚠️ User profile error:', userError)
              // Create basic user object from session
              const basicUser: AppUser = {
                id: session.user.id,
                email: session.user.email || '',
                role: 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
              setUser(basicUser)
            } else {
              setUser(userData)
            }
          } catch (profileError) {
            console.error('❌ Profile fetch error:', profileError)
            // Fallback to basic user
            const basicUser: AppUser = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            setUser(basicUser)
          }
        } else {
          console.log('📝 No session found')
          setSession(null)
          setUser(null)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
          setInitialized(true)
          console.log('✅ Auth initialization complete')
        }
      }
    }

    initializeAuth()
    
    return () => {
      mounted = false
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, session?.user?.email || 'No user')
      
      try {
        if (event === 'SIGNED_IN') {
          console.log('✅ User signed in via auth listener:', session?.user?.email)
          setSession(session)
          if (session?.user && initialized) {
            // Only fetch profile if not already done during signIn
            if (!user || user.id !== session.user.id) {
              await fetchUserProfile(session.user.id)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out via auth listener')
          setSession(null)
          setUser(null)
          setLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed')
          setSession(session)
          // Don't refetch profile on token refresh
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Error fetching user profile:', error)
        
        // If user profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const newUser: Omit<AppUser, 'id' | 'created_at' | 'updated_at'> = {
            email: session?.user?.email || '',
            role: 'user' // Default to user role
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert([{ id: userId, ...newUser }])
            .select()
            .single()

          if (createError) {
            console.error('Error creating user profile:', createError)
            // Fallback user object
            const fallbackUser: AppUser = {
              id: userId,
              email: session?.user?.email || '',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            setUser(fallbackUser)
          } else {
            setUser(createdProfile)
          }
        } else {
          // Other errors - use fallback
          const fallbackUser: AppUser = {
            id: userId,
            email: session?.user?.email || '',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setUser(fallbackUser)
        }
      } else {
        setUser(data)
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error)
      // Fallback user object
      const fallbackUser: AppUser = {
        id: userId,
        email: session?.user?.email || '',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setUser(fallbackUser)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true)
      console.log('🔑 Attempting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        console.error('❌ Sign in failed:', error.message)
        const errorInfo = handleSupabaseError(error, 'sign in')
        setLoading(false)
        return { error: errorInfo.message }
      }

      if (!data.user || !data.session) {
        setLoading(false)
        return { error: 'Authentication failed' }
      }

      console.log('✅ Sign in successful for:', data.user.email)
      
      // Set session and fetch user profile immediately
      setSession(data.session)
      await fetchUserProfile(data.user.id)
      
      return {}
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
      return { error: 'Authentication failed. Please try again.' }
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true)
      console.log('🚪 Signing out user...')
      
      // Clear local state first
      setUser(null)
      setSession(null)
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Sign out error:', error)
      } else {
        console.log('✅ Sign out successful')
      }
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Still clear local state even if signOut fails
      setUser(null)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = user?.role === 'admin'

  const value: AuthContextType = {
    user,
    session,
    loading,
    initialized,
    signIn,
    signOut,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}