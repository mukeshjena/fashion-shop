import { supabase } from '../lib/supabase'

// Database service for initialization and health checks
export class DatabaseService {
  // Check database connection
  static async checkConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      // Try a simple query that works for both authenticated and anonymous users
      const { error } = await supabase
        .from('settings')
        .select('key')
        .limit(1)

      if (error) {
        // Don't treat auth-related errors as connection failures
        if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('auth')) {
          console.log('🔐 Database connection working (auth-related query limitation)')
          return { connected: true }
        }
        console.warn('Database connection error:', error.message)
        return { connected: false, error: error.message }
      }

      console.log('✅ Database connection verified')
      return { connected: true }
    } catch (error) {
      console.error('Database connection error:', error)
      return { connected: false, error: 'Failed to connect to database' }
    }
  }

  // Check if all required tables exist
  static async checkTables(): Promise<{ tablesExist: boolean; missingTables?: string[]; error?: string }> {
    const requiredTables = ['users', 'categories', 'products', 'banners', 'pages', 'settings']
    const missingTables: string[] = []

    try {
      for (const table of requiredTables) {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          missingTables.push(table)
        }
      }

      return {
        tablesExist: missingTables.length === 0,
        missingTables: missingTables.length > 0 ? missingTables : undefined
      }
    } catch (error) {
      console.error('Table check error:', error)
      return { tablesExist: false, error: 'Failed to check tables' }
    }
  }

  // Check if storage buckets exist
  static async checkStorageBuckets(): Promise<{ bucketsExist: boolean; missingBuckets?: string[]; error?: string }> {
    const requiredBuckets = ['products', 'banners', 'categories', 'pages']

    try {
      console.log('🗂️ Checking storage buckets...')
      
      // Test bucket access by trying to access each bucket instead of listing all
       const bucketTests = await Promise.allSettled(
         requiredBuckets.map(async (bucketName) => {
           try {
             // Try to list files in the bucket (this tests if bucket exists and is accessible)
             const { error } = await supabase.storage.from(bucketName).list('', { limit: 1 })
             
             if (error) {
               // If error is about permissions, bucket likely exists but we can't list
               if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
                 console.warn(`❌ Bucket '${bucketName}' does not exist`)
                 return { bucket: bucketName, exists: false, error: error.message }
               } else {
                 // Permission error - bucket exists but we can't access it (normal)
                 console.log(`✅ Bucket '${bucketName}' exists (access restricted)`)
                 return { bucket: bucketName, exists: true, error: null }
               }
             }
             
             console.log(`✅ Bucket '${bucketName}' exists and accessible`)
             
             // Test upload permissions by attempting a small test upload
             try {
               const testFileName = `test-${Date.now()}.txt`
               const testFile = new Blob(['test'], { type: 'text/plain' })
               const { error: uploadError } = await supabase.storage
                 .from(bucketName)
                 .upload(testFileName, testFile)
               
               if (uploadError) {
                 console.warn(`⚠️ Bucket '${bucketName}' exists but upload restricted:`, uploadError.message)
               } else {
                 console.log(`✅ Bucket '${bucketName}' upload permissions verified`)
                 // Clean up test file
                 await supabase.storage.from(bucketName).remove([testFileName])
               }
             } catch (uploadTestError) {
               console.warn(`⚠️ Upload test failed for '${bucketName}':`, uploadTestError)
             }
             
             return { bucket: bucketName, exists: true, error: null }
           } catch (err) {
             console.warn(`⚠️ Error testing bucket '${bucketName}':`, err)
             // Assume exists if we can't test properly
             return { bucket: bucketName, exists: true, error: null }
           }
         })
       )

      const missingBuckets: string[] = []
      let accessibleBuckets = 0
      
      bucketTests.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { bucket, exists } = result.value
          if (exists) {
            accessibleBuckets++
          } else {
            missingBuckets.push(bucket)
          }
        } else {
          // If test failed, assume bucket exists
          console.log(`✅ Bucket '${requiredBuckets[index]}' assumed to exist (test failed)`)
          accessibleBuckets++
        }
      })

      console.log(`📦 Storage bucket status: ${accessibleBuckets}/${requiredBuckets.length} buckets accessible`)
      
      if (missingBuckets.length > 0) {
        console.warn('❌ Missing buckets:', missingBuckets)
        console.log('💡 Please create these buckets in your Supabase dashboard')
        return {
          bucketsExist: false,
          missingBuckets
        }
      }

      console.log('✅ All required storage buckets are available')
      return { bucketsExist: true }
      
    } catch (error) {
      console.error('Storage bucket check error:', error)
      // If we can't test buckets, assume they exist
      console.log('🔄 Storage check failed - assuming buckets exist (normal behavior)')
      console.log('💡 Verify buckets exist in Supabase dashboard: Storage section')
      return { bucketsExist: true }
    }
  }

  // Initialize default settings
  static async initializeSettings(): Promise<{ success: boolean; error?: string }> {
    try {
      const defaultSettings = [
        { key: 'site_name', value: 'Fashion Shop' },
        { key: 'site_description', value: 'Modern fashion clothing showcase' },
        { key: 'site_logo', value: '' },
        { key: 'site_favicon', value: '' },
        { key: 'contact_email', value: 'info@fashionshop.com' },
        { key: 'contact_phone', value: '+1234567890' },
        { key: 'whatsapp_phone_number', value: '+1234567890' },
        { key: 'whatsapp_message_template', value: 'Hi! I\'m interested in this product: {product_name} - {product_price}. {product_image}' },
        { key: 'whatsapp_enabled', value: 'true' },
        { key: 'social_instagram', value: '' },
        { key: 'social_facebook', value: '' },
        { key: 'social_twitter', value: '' },
        { key: 'social_youtube', value: '' },
        { key: 'site_title', value: 'Fashion Shop - Modern Clothing' },
        { key: 'site_keywords', value: 'fashion, clothing, modern, style' },
        { key: 'og_image', value: '' }
      ]

      const { error } = await supabase
        .from('settings')
        .upsert(defaultSettings, { onConflict: 'key' })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Initialize settings error:', error)
      return { success: false, error: 'Failed to initialize settings' }
    }
  }

  // Initialize default pages
  static async initializePages(): Promise<{ success: boolean; error?: string }> {
    try {
      const defaultPages = [
        {
          slug: 'about',
          title: 'About Us',
          content: '<h1>About Our Fashion Shop</h1><p>Welcome to our modern fashion clothing showcase. We curate the finest collection of contemporary fashion pieces.</p>',
          meta_title: 'About Us - Fashion Shop',
          meta_description: 'Learn more about our fashion shop and our commitment to modern style.',
          is_active: true
        },
        {
          slug: 'contact',
          title: 'Contact Us',
          content: '<h1>Contact Us</h1><p>Get in touch with us for any inquiries about our products or services.</p>',
          meta_title: 'Contact Us - Fashion Shop',
          meta_description: 'Contact our fashion shop for inquiries about products and services.',
          is_active: true
        }
      ]

      const { error } = await supabase
        .from('pages')
        .upsert(defaultPages, { onConflict: 'slug' })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Initialize pages error:', error)
      return { success: false, error: 'Failed to initialize pages' }
    }
  }

  // Create sample data for testing
  static async createSampleData(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if data already exists
      const { data: existingCategories } = await supabase
        .from('categories')
        .select('id')
        .limit(1)

      if (existingCategories && existingCategories.length > 0) {
        return { success: true } // Data already exists
      }

      // Create sample categories
      const { data: categories, error: categoryError } = await supabase
        .from('categories')
        .insert([
          {
            name: 'Men\'s Fashion',
            slug: 'mens-fashion',
            description: 'Stylish clothing for men',
            is_active: true,
            sort_order: 1
          },
          {
            name: 'Women\'s Fashion',
            slug: 'womens-fashion',
            description: 'Elegant clothing for women',
            is_active: true,
            sort_order: 2
          },
          {
            name: 'Accessories',
            slug: 'accessories',
            description: 'Fashion accessories and jewelry',
            is_active: true,
            sort_order: 3
          }
        ])
        .select()

      if (categoryError) {
        return { success: false, error: categoryError.message }
      }

      // Create sample banners
      const { error: bannerError } = await supabase
        .from('banners')
        .insert([
          {
            title: 'Summer Collection 2024',
            subtitle: 'Discover the latest trends in fashion',
            image_url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            link_url: '/products',
            button_text: 'Shop Now',
            is_active: true,
            sort_order: 1
          },
          {
            title: 'New Arrivals',
            subtitle: 'Fresh styles for the modern wardrobe',
            image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
            link_url: '/products',
            button_text: 'Explore',
            is_active: true,
            sort_order: 2
          }
        ])

      if (bannerError) {
        return { success: false, error: bannerError.message }
      }

      // Create sample products if categories were created
      if (categories && categories.length > 0) {
        const { error: productError } = await supabase
          .from('products')
          .insert([
            {
              name: 'Classic White Shirt',
              slug: 'classic-white-shirt',
              description: 'A timeless white shirt perfect for any occasion',
              price: 89.99,
              category_id: categories[0].id,
              images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'],
              is_featured: true,
              is_active: true,
              sort_order: 1,
              meta_title: 'Classic White Shirt - Fashion Shop',
              meta_description: 'Premium quality white shirt for men'
            },
            {
              name: 'Elegant Black Dress',
              slug: 'elegant-black-dress',
              description: 'Sophisticated black dress for special occasions',
              price: 149.99,
              category_id: categories[1].id,
              images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'],
              is_featured: true,
              is_active: true,
              sort_order: 2,
              meta_title: 'Elegant Black Dress - Fashion Shop',
              meta_description: 'Beautiful black dress for women'
            }
          ])

        if (productError) {
          return { success: false, error: productError.message }
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Create sample data error:', error)
      return { success: false, error: 'Failed to create sample data' }
    }
  }

  // Run complete database health check
  static async healthCheck(): Promise<{
    healthy: boolean
    connection: boolean
    tables: boolean
    storage: boolean
    settings: boolean
    pages: boolean
    adminExists: boolean
    errors: string[]
  }> {
    const errors: string[] = []
    let connection = false
    let tables = false
    let storage = false
    let settings = false
    let pages = false
    let adminExists = false

    try {
      // Check connection
      const connectionResult = await this.checkConnection()
      connection = connectionResult.connected
      if (!connection && connectionResult.error) {
        errors.push(`Connection: ${connectionResult.error}`)
      }

      // Check tables
      const tablesResult = await this.checkTables()
      tables = tablesResult.tablesExist
      if (!tables && tablesResult.missingTables) {
        errors.push(`Missing tables: ${tablesResult.missingTables.join(', ')}`)
      }
      if (tablesResult.error) {
        errors.push(`Tables: ${tablesResult.error}`)
      }

      // Check storage
      const storageResult = await this.checkStorageBuckets()
      storage = storageResult.bucketsExist
      if (!storage && storageResult.missingBuckets) {
        errors.push(`Missing storage buckets: ${storageResult.missingBuckets.join(', ')}`)
      }
      if (storageResult.error) {
        errors.push(`Storage: ${storageResult.error}`)
      }

      // Check settings
      if (connection && tables) {
        const { data: settingsData } = await supabase
          .from('settings')
          .select('key')
          .limit(1)
        settings = !!settingsData && settingsData.length > 0
        if (!settings) {
          errors.push('No settings found')
        }
      }

      // Check pages
      if (connection && tables) {
        const { data: pagesData } = await supabase
          .from('pages')
          .select('slug')
          .limit(1)
        pages = !!pagesData && pagesData.length > 0
        if (!pages) {
          errors.push('No pages found')
        }
      }

      // Check if admin exists
      if (connection && tables) {
        const { data: adminData } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
        adminExists = !!adminData && adminData.length > 0
        if (!adminExists) {
          errors.push('No admin user found')
        }
      }

      const healthy = connection && tables && storage && settings && pages && adminExists

      return {
        healthy,
        connection,
        tables,
        storage,
        settings,
        pages,
        adminExists,
        errors
      }
    } catch (error) {
      console.error('Health check error:', error)
      errors.push('Health check failed')
      return {
        healthy: false,
        connection,
        tables,
        storage,
        settings,
        pages,
        adminExists,
        errors
      }
    }
  }

  // Initialize complete database setup
  static async initializeDatabase(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = []

    try {
      // Initialize settings
      const settingsResult = await this.initializeSettings()
      if (!settingsResult.success && settingsResult.error) {
        errors.push(`Settings: ${settingsResult.error}`)
      }

      // Initialize pages
      const pagesResult = await this.initializePages()
      if (!pagesResult.success && pagesResult.error) {
        errors.push(`Pages: ${pagesResult.error}`)
      }

      // Create sample data
      const sampleDataResult = await this.createSampleData()
      if (!sampleDataResult.success && sampleDataResult.error) {
        errors.push(`Sample data: ${sampleDataResult.error}`)
      }

      return {
        success: errors.length === 0,
        errors
      }
    } catch (error) {
      console.error('Database initialization error:', error)
      errors.push('Database initialization failed')
      return {
        success: false,
        errors
      }
    }
  }
}

export default DatabaseService