import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Upload, X } from 'lucide-react'
import { generateSlug, formatPrice, compressImage } from '../../utils'
import useCategories from '../../hooks/useCategories'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { adminServices } from '../../services/adminService'
import type { Product } from '../../types'

interface ProductFormData {
  name: string
  slug: string
  description: string
  price: number
  category_id: string
  images: string[]
  videos: string[]
  is_featured: boolean
  is_active: boolean
  sort_order: number
  meta_title: string
  meta_description: string
}

const initialFormData: ProductFormData = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  category_id: '',
  images: [],
  videos: [],
  is_featured: false,
  is_active: true,
  sort_order: 0,
  meta_title: '',
  meta_description: ''
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  const { categories } = useCategories()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (formData.name && !editingProduct) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.name),
        meta_title: prev.name
      }))
    }
  }, [formData.name, editingProduct])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await adminServices.products.getAll({
        category: selectedCategory || undefined,
        search: searchTerm || undefined
      })
      
      if (response.success && response.data) {
        setProducts(response.data)
      } else {
        setErrors({ fetch: response.error || 'Failed to fetch products' })
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setErrors({ fetch: 'Failed to fetch products' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setErrors({})

      let response
      if (editingProduct) {
        response = await adminServices.products.update(editingProduct.id, formData)
      } else {
        response = await adminServices.products.create(formData)
      }

      if (response.success) {
        await fetchProducts()
        handleCloseForm()
      } else {
        setErrors({ submit: response.error || 'Failed to save product' })
      }
    } catch (error) {
      console.error('Error saving product:', error)
      setErrors({ submit: 'Failed to save product. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: product.price,
      category_id: product.category_id,
      images: product.images || [],
      videos: product.videos || [],
      is_featured: product.is_featured,
      is_active: product.is_active,
      sort_order: product.sort_order,
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setLoading(true)
      const response = await adminServices.products.delete(id)
      
      if (response.success) {
        await fetchProducts()
      } else {
        setErrors({ delete: response.error || 'Failed to delete product' })
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      setErrors({ delete: 'Failed to delete product' })
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (product: Product) => {
    try {
      setLoading(true)
      const response = await adminServices.products.update(product.id, { is_active: !product.is_active })
      
      if (response.success) {
        await fetchProducts()
      } else {
        setErrors({ toggle: response.error || 'Failed to update product status' })
      }
    } catch (error) {
      console.error('Error updating product status:', error)
      setErrors({ toggle: 'Failed to update product status' })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      setErrors({})
      const previewUrls: string[] = []

      // Create immediate previews
      for (const file of Array.from(files)) {
        const previewUrl = URL.createObjectURL(file)
        previewUrls.push(previewUrl)
      }

      // Add previews immediately
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...previewUrls]
      }))

      // Upload files and replace previews with actual URLs
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const previewUrl = previewUrls[i]
        
        try {
          // Compress image
          const compressedFile = await compressImage(file)
          
          // Upload using admin service
          const response = await adminServices.files.uploadImage(compressedFile, 'products')
          
          if (response.success && response.data) {
            console.log(`🔄 Replacing preview URL with actual URL:`, {
              previewUrl: previewUrl.substring(0, 50) + '...',
              actualUrl: response.data.substring(0, 100) + '...'
            })
            
            // Replace preview URL with actual URL
            setFormData(prev => {
              const updatedImages = prev.images.map(img => {
                if (img === previewUrl) {
                  console.log(`✅ Replaced preview URL with: ${response.data}`)
                  return response.data!
                }
                return img
              })
              console.log(`📝 Updated images array:`, updatedImages.map(url => url.substring(0, 50) + '...'))
              return {
                ...prev,
                images: updatedImages
              }
            })
            
            // Clean up preview URL
            URL.revokeObjectURL(previewUrl)
            console.log(`🧹 Cleaned up preview URL`)
          } else {
            console.error(`❌ Upload failed for preview:`, previewUrl.substring(0, 50) + '...', response.error)
            
            // Remove failed preview
            setFormData(prev => ({
              ...prev,
              images: prev.images.filter(img => img !== previewUrl)
            }))
            URL.revokeObjectURL(previewUrl)
            setErrors({ upload: response.error || 'Failed to upload image' })
          }
        } catch (uploadError) {
          // Remove failed preview
          setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img !== previewUrl)
          }))
          URL.revokeObjectURL(previewUrl)
          console.error('Error uploading image:', uploadError)
        }
      }
    } catch (error) {
      console.error('Error processing images:', error)
      setErrors({ upload: 'Failed to process images' })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    setFormData(initialFormData)
    setErrors({})
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Products</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your product catalog
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
            Showing {Math.min(filteredProducts.length, itemsPerPage)} of {filteredProducts.length} products
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {product.images && product.images.length > 0 ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={product.images[0]}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {product.category?.name || 'No Category'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(product)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.is_active ? (
                        <><Eye className="w-3 h-3 mr-1" /> Active</>
                      ) : (
                        <><EyeOff className="w-3 h-3 mr-1" /> Inactive</>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.is_featured
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_featured ? 'Featured' : 'Regular'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1
                const isCurrentPage = page === currentPage
                const showPage = page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)
                
                if (!showPage) {
                  if (page === currentPage - 3 || page === currentPage + 3) {
                    return <span key={page} className="px-2 text-gray-400 dark:text-gray-500">...</span>
                  }
                  return null
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isCurrentPage
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {errors.submit}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value
                        setFormData(prev => ({
                          ...prev,
                          name,
                          slug: !editingProduct ? generateSlug(name) : prev.slug
                        }))
                      }}
                      className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent ${
                        errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter product name"
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
                      placeholder="product-slug"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${
                        errors.category_id ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category_id}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.price ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
                    )}
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
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter product description"
                  />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Images
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {uploading ? 'Uploading...' : 'Upload Images'}
                          </span>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {uploading && <LoadingSpinner size="sm" />}
                    </div>
                    
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                              onLoad={() => console.log(`✅ Image loaded successfully: ${image.substring(0, 50)}...`)}
                              onError={(e) => {
                                console.error(`❌ Image failed to load: ${image.substring(0, 50)}...`)
                                console.error('Image error details:', e)
                                // Show a placeholder or error state
                                e.currentTarget.style.backgroundColor = '#f3f4f6'
                                e.currentTarget.style.border = '2px dashed #d1d5db'
                              }}
                              onLoadStart={() => console.log(`🔄 Started loading image: ${image.substring(0, 50)}...`)}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SEO Fields */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">SEO Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        value={formData.meta_title}
                        onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="SEO title for this product"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.meta_description}
                        onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="SEO description for this product"
                      />
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="flex space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 bg-white dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured Product</span>
                  </label>
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
                    <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
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