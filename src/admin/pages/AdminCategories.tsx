import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { generateSlug, compressImage } from '../../utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { adminServices } from '../../services/adminService'
import type { Category } from '../../types'

interface CategoryFormData {
  name: string
  slug: string
  description: string
  image_url: string
  is_active: boolean
  sort_order: number
}

const initialFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  is_active: true,
  sort_order: 0
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (formData.name && !editingCategory) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.name)
      }))
    }
  }, [formData.name, editingCategory])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Category name is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setLoading(true)
      setErrors({})

      const categoryData = {
        ...formData,
        updated_at: new Date().toISOString()
      }

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData])

        if (error) throw error
      }

      await fetchCategories()
      handleCloseForm()
    } catch (error) {
      console.error('Error saving category:', error)
      setErrors({ submit: 'Failed to save category. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
      sort_order: category.sort_order
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will affect all products in this category.')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const toggleStatus = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id)

      if (error) throw error
      await fetchCategories()
    } catch (error) {
      console.error('Error updating category status:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      // Create immediate preview
      const previewUrl = URL.createObjectURL(file)
      setFormData(prev => ({
        ...prev,
        image_url: previewUrl
      }))
      
      // Compress image
      const compressedFile = await compressImage(file)
      
      console.log(`🔄 Uploading category image...`)
      
      // Upload using admin service for consistency
      const response = await adminServices.files.uploadImage(compressedFile, 'categories')
      
      if (response.success && response.data) {
        console.log(`✅ Category image upload successful: ${response.data}`)
        
        // Replace preview with actual URL
        setFormData(prev => ({
          ...prev,
          image_url: response.data!
        }))
        
        // Clean up preview URL
        URL.revokeObjectURL(previewUrl)
        console.log(`🧹 Cleaned up category preview URL`)
      } else {
        console.error(`❌ Category image upload failed:`, response.error)
        
        // Revert to empty if upload fails
        setFormData(prev => ({
          ...prev,
          image_url: ''
        }))
        URL.revokeObjectURL(previewUrl)
        throw new Error(response.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }))
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData(initialFormData)
    setErrors({})
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && !showForm) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="mt-2 text-gray-600">
            Manage your product categories
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {filteredCategories.length} of {categories.length} categories
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-16 aspect-h-9">
              {category.image_url ? (
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">No Image</span>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {category.name}
                </h3>
                <button
                  onClick={() => toggleStatus(category)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.is_active
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                  }`}
                >
                  {category.is_active ? (
                    <><Eye className="w-3 h-3 mr-1" /> Active</>
                  ) : (
                    <><EyeOff className="w-3 h-3 mr-1" /> Inactive</>
                  )}
                </button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                /{category.slug}
              </p>
              
              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Sort: {category.sort_order}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? 'No categories found' : 'No categories yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first category to organize your products'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add Category
            </button>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.submit && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
                    {errors.submit}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value
                        setFormData(prev => ({
                          ...prev,
                          name,
                          slug: !editingCategory ? generateSlug(name) : prev.slug
                        }))
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter category name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="category-slug"
                    />
                  </div>

                  {/* Sort Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter category description"
                  />
                </div>

                {/* Category Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Image
                  </label>
                  <div className="space-y-4">
                    {formData.image_url ? (
                      <div className="relative inline-block">
                        <img
                          src={formData.image_url}
                          alt="Category"
                          className="w-32 h-32 object-cover rounded-lg"
                          onLoad={() => console.log(`✅ Category image loaded successfully: ${formData.image_url.substring(0, 50)}...`)}
                          onError={(e) => {
                            console.error(`❌ Category image failed to load: ${formData.image_url.substring(0, 50)}...`)
                            console.error('Category image error details:', e)
                            // Show a placeholder or error state
                            e.currentTarget.style.backgroundColor = '#f3f4f6'
                            e.currentTarget.style.border = '2px dashed #d1d5db'
                          }}
                          onLoadStart={() => console.log(`🔄 Started loading category image: ${formData.image_url.substring(0, 50)}...`)}
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors block">
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {uploading ? 'Uploading...' : 'Upload Category Image'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                    {uploading && (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Uploading image...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Checkbox */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 bg-white dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {loading && <LoadingSpinner size="sm" />}
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}