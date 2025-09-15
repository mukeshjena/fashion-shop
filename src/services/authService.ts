import { supabase } from '../lib/supabase'
import type { User as AppUser } from '../types'

// Auth service for admin operations
export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<{ user?: AppUser; error?: string }> {
    try {
      if (!email?.trim() || !password?.trim()) {
        return { error: 'Email and password are required' }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        return { error: error.message }
      }

      if (!data.user) {
        return { error: 'Authentication failed' }
      }

      // Fetch user profile from our users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          const newUser: Omit<AppUser, 'id' | 'created_at' | 'updated_at'> = {
            email: data.user.email!,
            role: 'user' // Default role
          }

          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert([{ id: data.user.id, ...newUser }])
            .select()
            .single()

          if (createError) {
            return { error: 'Failed to create user profile' }
          }

          return { user: createdProfile }
        }
        return { error: 'Failed to fetch user profile' }
      }

      return { user: userProfile }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'Authentication failed. Please try again.' }
    }
  }

  // Sign out
  static async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { error: error.message }
      }
      return {}
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: 'Failed to sign out' }
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        return { error: error.message }
      }
      return { session }
    } catch (error) {
      console.error('Get session error:', error)
      return { error: 'Failed to get session' }
    }
  }

  // Get current user profile
  static async getCurrentUser(): Promise<{ user?: AppUser; error?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return { error: error.message }
      }

      if (!user) {
        return { error: 'No authenticated user' }
      }

      // Fetch user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        return { error: 'Failed to fetch user profile' }
      }

      return { user: userProfile }
    } catch (error) {
      console.error('Get current user error:', error)
      return { error: 'Failed to get current user' }
    }
  }

  // Check if user is admin
  static async isAdmin(): Promise<{ isAdmin: boolean; error?: string }> {
    try {
      const { user, error } = await this.getCurrentUser()
      
      if (error || !user) {
        return { isAdmin: false, error: error || 'No user found' }
      }

      return { isAdmin: user.role === 'admin' }
    } catch (error) {
      console.error('Check admin error:', error)
      return { isAdmin: false, error: 'Failed to check admin status' }
    }
  }

  // Update user role (admin only)
  static async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<{ user?: AppUser; error?: string }> {
    try {
      // Check if current user is admin
      const { isAdmin, error: adminError } = await this.isAdmin()
      if (adminError || !isAdmin) {
        return { error: 'Unauthorized: Admin access required' }
      }

      const { data, error } = await supabase
        .from('users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { error: error.message }
      }

      return { user: data }
    } catch (error) {
      console.error('Update user role error:', error)
      return { error: 'Failed to update user role' }
    }
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<{ users?: AppUser[]; error?: string }> {
    try {
      // Check if current user is admin
      const { isAdmin, error: adminError } = await this.isAdmin()
      if (adminError || !isAdmin) {
        return { error: 'Unauthorized: Admin access required' }
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { error: error.message }
      }

      return { users: data || [] }
    } catch (error) {
      console.error('Get all users error:', error)
      return { error: 'Failed to fetch users' }
    }
  }

  // Create admin user (for initial setup)
  static async createAdminUser(email: string, password: string): Promise<{ user?: AppUser; error?: string }> {
    try {
      // Check if any admin users exist
      const { data: existingAdmins, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1)

      if (checkError) {
        return { error: 'Failed to check existing admins' }
      }

      if (existingAdmins && existingAdmins.length > 0) {
        return { error: 'Admin user already exists' }
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      if (!data.user) {
        return { error: 'Failed to create user' }
      }

      // Create user profile with admin role
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email,
          role: 'admin'
        }])
        .select()
        .single()

      if (profileError) {
        return { error: 'Failed to create admin profile' }
      }

      return { user: userProfile }
    } catch (error) {
      console.error('Create admin user error:', error)
      return { error: 'Failed to create admin user' }
    }
  }

  // Reset password
  static async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: 'Failed to send reset password email' }
    }
  }

  // Update password
  static async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      console.error('Update password error:', error)
      return { error: 'Failed to update password' }
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export default AuthService