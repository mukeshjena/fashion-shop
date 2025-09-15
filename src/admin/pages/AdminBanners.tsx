import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Upload, X, Play } from 'lucide-react'
import { compressImage } from '../../utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { adminServices } from '../../services/adminService'
import type { Banner } from '../../types'

interface BannerFormData {
  title: string
  subtitle: string
  image_url: string
  video_url: string
  link_url: string
  button_text: string
  is_active: boolean
  sort_order: number
}

const initialFormData: BannerFormData = {
  title: '',
  subtitle: '',
  image_url: '',
  video_url: '',
  link_url: '',
  button_text: '',
  is_active: true,
  sort_order: 0
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState<BannerFormData>(initialFormData)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState<'image' | 'video'>('image')

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const response = await adminServices.banners.getAll()
      
      if (response.success && response.data) {
        setBanners(response.data)
      } else {
        setErrors({ fetch: response.error || 'Failed to fetch banners' })
      }
    } catch (error) {
      console.error('Error fetching banners:', error)
      setErrors({ fetch: 'Failed to fetch banners' })
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
      if (editingBanner) {
        response = await adminServices.banners.update(editingBanner.id, formData)
      } else {
        response = await adminServices.banners.create(formData)
      }

      if (response.success) {
        await fetchBanners()
        handleCloseForm()
      } else {
        setErrors({ submit: response.error || 'Failed to save banner' })
      }
    } catch (error) {
      console.error('Error saving banner:', error)
      setErrors({ submit: 'Failed to save banner. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      video_url: banner.video_url || '',
      link_url: banner.link_url || '',
      button_text: banner.button_text || '',
      is_active: banner.is_active,
      sort_order: banner.sort_order
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return

    try {
      setLoading(true)
      const response = await adminServices.banners.delete(id)
      
      if (response.success) {
        await fetchBanners()
      } else {
        setErrors({ delete: response.error || 'Failed to delete banner' })
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      setErrors({ delete: 'Failed to delete banner' })
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (banner: Banner) => {
    try {
      setLoading(true)
      const response = await adminServices.banners.toggleStatus(banner.id, !banner.is_active)
      
      if (response.success) {
        await fetchBanners()
      } else {
        setErrors({ toggle: response.error || 'Failed to update banner status' })
      }
    } catch (error) {
      console.error('Error updating banner status:', error)
      setErrors({ toggle: 'Failed to update banner status' })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setErrors({})
      
      // Create immediate preview
      const previewUrl = URL.createObjectURL(file)
      setFormData(prev => ({
        ...prev,
        image_url: previewUrl
      }))
      
      // Compress image
      const compressedFile = await compressImage(file)
      
      // Upload using admin service
      const response = await adminServices.files.uploadImage(compressedFile, 'banners')
      
      if (response.success && response.data) {
        // Replace preview with actual URL
        setFormData(prev => ({
          ...prev,
          image_url: response.data!
        }))
        // Clean up preview URL
        URL.revokeObjectURL(previewUrl)
      } else {
        // Revert to empty if upload fails
        setFormData(prev => ({
          ...prev,
          image_url: ''
        }))
        URL.revokeObjectURL(previewUrl)
        setErrors({ upload: response.error || 'Failed to upload image' })
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      // Revert to empty if upload fails
      setFormData(prev => ({
        ...prev,
        image_url: ''
      }))
      setErrors({ upload: 'Failed to upload image' })
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setErrors({})
      
      // Upload using admin service
      const response = await adminServices.files.uploadVideo(file, 'banners')
      
      if (response.success && response.data) {
        setFormData(prev => ({
          ...prev,
          video_url: response.data!
        }))
      } else {
        setErrors({ upload: response.error || 'Failed to upload video' })
      }
    } catch (error) {
      console.error('Error uploading video:', error)
      setErrors({ upload: 'Failed to upload video' })
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

  const removeVideo = () => {
    setFormData(prev => ({
      ...prev,
      video_url: ''
    }))
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingBanner(null)
    setFormData(initialFormData)
    setErrors({})
    setPreviewMode('image')
  }

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
          <p className="mt-2 text-gray-600">
            Manage your homepage banners and promotional content
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing {filteredBanners.length} of {banners.length} banners
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBanners.map((banner) => (
          <div key={banner.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-16 aspect-h-9 relative">
              {banner.video_url ? (
                <video
                  src={banner.video_url}
                  className="w-full h-48 object-cover"
                  muted
                  loop
                  controls
                />
              ) : (
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="text-center text-white p-4">
                  <h3 className="text-lg font-semibold mb-2">{banner.title}</h3>
                  {banner.subtitle && (
                    <p className="text-sm opacity-90">{banner.subtitle}</p>
                  )}
                  {banner.button_text && (
                    <button className="mt-3 px-4 py-2 bg-white text-black text-sm font-medium rounded">
                      {banner.button_text}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => toggleStatus(banner)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    banner.is_active
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                  }`}
                >
                  {banner.is_active ? (
                    <><Eye className="w-3 h-3 mr-1" /> Active</>
                  ) : (
                    <><EyeOff className="w-3 h-3 mr-1" /> Inactive</>
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <span>Sort: {banner.sort_order}</span>
                <div className="flex items-center space-x-2">
                  {banner.video_url && (
                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 text-xs rounded">
                      <Play className="w-3 h-3 mr-1" />
                      Video
                    </span>
                  )}
                  {banner.link_url && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded">
                      Link
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(banner)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredBanners.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {searchTerm ? 'No banners found' : 'No banners yet'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first banner to showcase on your homepage'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add Banner
            </button>
          )}
        </div>
      )}

      {/* Banner Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
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
                  {/* Banner Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Banner Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                        errors.title ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Enter banner title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                    )}
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Enter banner subtitle"
                    />
                  </div>

                  {/* Link URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Link URL
                    </label>
                    <input
                      type="url"
                      value={formData.link_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Button Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.button_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                      placeholder="Shop Now"
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

                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Banner Media *
                  </label>
                  
                  {/* Media Type Toggle */}
                  <div className="flex space-x-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('image')}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        previewMode === 'image'
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('video')}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        previewMode === 'video'
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Video
                    </button>
                  </div>

                  {previewMode === 'image' ? (
                    <div className="space-y-4">
                      {formData.image_url ? (
                        <div className="relative inline-block">
                          <img
                            src={formData.image_url}
                            alt="Banner"
                            className="w-full max-w-md h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors block">
                          <div className="flex flex-col items-center space-y-2">
                            <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {uploading ? 'Uploading...' : 'Upload Banner Image'}
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
                      {errors.image_url && (
                        <p className="text-sm text-red-600 dark:text-red-400">{errors.image_url}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.video_url ? (
                        <div className="relative inline-block">
                          <video
                            src={formData.video_url}
                            className="w-full max-w-md h-48 object-cover rounded-lg"
                            controls
                          />
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors block">
                          <div className="flex flex-col items-center space-y-2">
                            <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {uploading ? 'Uploading...' : 'Upload Banner Video'}
                            </span>
                          </div>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">Uploading media...</span>
                    </div>
                  )}
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
                    <span>{editingBanner ? 'Update Banner' : 'Create Banner'}</span>
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