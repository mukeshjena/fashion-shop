import { useState, useEffect } from 'react'
import { Save, Upload, X, Globe, MessageCircle, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { compressImage } from '../../utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'


interface SettingsData {
  // Site Settings
  site_name: string
  site_description: string
  site_logo: string
  site_favicon: string
  contact_email: string
  contact_phone: string
  
  // Social Links
  social_instagram: string
  social_facebook: string
  social_twitter: string
  social_youtube: string
  
  // WhatsApp Settings
  whatsapp_phone_number: string
  whatsapp_message_template: string
  whatsapp_enabled: string
  
  // SEO Settings
  site_title: string
  site_keywords: string
  og_image: string
}

const initialSettingsData: SettingsData = {
  site_name: '',
  site_description: '',
  site_logo: '',
  site_favicon: '',
  contact_email: '',
  contact_phone: '',
  social_instagram: '',
  social_facebook: '',
  social_twitter: '',
  social_youtube: '',
  whatsapp_phone_number: '',
  whatsapp_message_template: 'Hi! I\'m interested in this product: {product_name} - {product_price}. {product_image}',
  whatsapp_enabled: 'true',
  site_title: '',
  site_keywords: '',
  og_image: ''
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsData>(initialSettingsData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'site' | 'social' | 'whatsapp' | 'seo'>('site')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('settings')
        .select('*')

      if (error) throw error

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)

      setSettings({ ...initialSettingsData, ...settingsMap })
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setErrors({})
      setSuccessMessage('')

      // Validate required fields
      const newErrors: Record<string, string> = {}
      if (!settings.site_name.trim()) newErrors.site_name = 'Site name is required'
      if (!settings.contact_email.trim()) newErrors.contact_email = 'Contact email is required'
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      // Convert settings object to array of key-value pairs
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value || '',
        updated_at: new Date().toISOString()
      }))

      // Upsert all settings
      for (const setting of settingsArray) {
        const { error } = await supabase
          .from('settings')
          .upsert(setting, { onConflict: 'key' })

        if (error) throw error
      }

      setSuccessMessage('Settings saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setErrors({ submit: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'site_logo' | 'site_favicon' | 'og_image') => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      
      // Compress image
      const compressedFile = await compressImage(file)
      
      // Upload to Supabase Storage
      const fileName = `${field}-${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('settings')
        .upload(fileName, compressedFile)

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pages')
        .getPublicUrl(fileName)

      setSettings(prev => ({
        ...prev,
        [field]: publicUrl
      }))
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (field: 'site_logo' | 'site_favicon' | 'og_image') => {
    setSettings(prev => ({
      ...prev,
      [field]: ''
    }))
  }

  const tabs = [
    { id: 'site', name: 'Site Settings', icon: Globe },
    { id: 'social', name: 'Social Media', icon: Globe },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle },
    { id: 'seo', name: 'SEO', icon: Search }
  ] as const

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Configure your site settings, social media, and integrations
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          {saving ? (
            <LoadingSpinner size="sm" className="border-white border-t-transparent" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
          {errors.submit}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'site' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Site Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    value={settings.site_name}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.site_name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Fashion Shop"
                  />
                  {errors.site_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.site_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 ${
                      errors.contact_email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="info@fashionshop.com"
                  />
                  {errors.contact_email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.contact_email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.contact_phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Description
                </label>
                <textarea
                  rows={3}
                  value={settings.site_description}
                  onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Modern fashion clothing showcase"
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Logo
                </label>
                <div className="space-y-4">
                  {settings.site_logo ? (
                    <div className="relative inline-block">
                      <img
                        src={settings.site_logo}
                        alt="Site Logo"
                        className="h-16 w-auto object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('site_logo')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-100 transition-colors inline-block">
                      <div className="flex items-center space-x-2">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {uploading ? 'Uploading...' : 'Upload Logo'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'site_logo')}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Favicon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Favicon
                </label>
                <div className="space-y-4">
                  {settings.site_favicon ? (
                    <div className="relative inline-block">
                      <img
                        src={settings.site_favicon}
                        alt="Favicon"
                        className="h-8 w-8 object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('site_favicon')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors inline-block">
                      <div className="flex items-center space-x-2">
                        <Upload className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {uploading ? 'Uploading...' : 'Upload Favicon'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'site_favicon')}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Social Media Links</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={settings.social_instagram}
                    onChange={(e) => setSettings(prev => ({ ...prev, social_instagram: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={settings.social_facebook}
                    onChange={(e) => setSettings(prev => ({ ...prev, social_facebook: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={settings.social_twitter}
                    onChange={(e) => setSettings(prev => ({ ...prev, social_twitter: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={settings.social_youtube}
                    onChange={(e) => setSettings(prev => ({ ...prev, social_youtube: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">WhatsApp Integration</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.whatsapp_enabled === 'true'}
                      onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_enabled: e.target.checked ? 'true' : 'false' }))}
                      className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 bg-white dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable WhatsApp Integration</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    value={settings.whatsapp_phone_number}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_phone_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="+1234567890"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Include country code (e.g., +1 for US, +44 for UK)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message Template
                  </label>
                  <textarea
                    rows={4}
                    value={settings.whatsapp_message_template}
                    onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_message_template: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Hi! I'm interested in this product: {product_name} - {product_price}. {product_image}"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Available variables: {'{product_name}'}, {'{product_price}'}, {'{product_image}'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">SEO Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Title
                  </label>
                  <input
                    type="text"
                    value={settings.site_title}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Fashion Shop - Modern Clothing"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This will appear in browser tabs and search results
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Keywords
                  </label>
                  <input
                    type="text"
                    value={settings.site_keywords}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_keywords: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="fashion, clothing, modern, style, shop"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Separate keywords with commas
                  </p>
                </div>

                {/* OG Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Open Graph Image
                  </label>
                  <div className="space-y-4">
                    {settings.og_image ? (
                      <div className="relative inline-block">
                        <img
                          src={settings.og_image}
                          alt="OG Image"
                          className="w-64 h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('og_image')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors block max-w-md">
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {uploading ? 'Uploading...' : 'Upload OG Image'}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'og_image')}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Recommended size: 1200x630px. This image will be shown when your site is shared on social media.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}