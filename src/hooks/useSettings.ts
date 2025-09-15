import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { WhatsAppSettings, SEOSettings, SiteSettings } from '../types'

interface UseSettingsReturn {
  settings: Record<string, string>
  whatsappSettings: WhatsAppSettings | null
  seoSettings: SEOSettings | null
  siteSettings: SiteSettings | null
  loading: boolean
  error: string | null
  fetchSettings: () => Promise<void>
  getSetting: (key: string, defaultValue?: string) => string
}

export default function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('*')

      if (fetchError) {
        throw fetchError
      }

      const settingsMap = (data || []).reduce((acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      }, {} as Record<string, string>)

      setSettings(settingsMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const getSetting = (key: string, defaultValue = ''): string => {
    return settings[key] || defaultValue
  }

  const whatsappSettings: WhatsAppSettings | null = settings.whatsapp_phone_number ? {
    phone_number: getSetting('whatsapp_phone_number'),
    message_template: getSetting('whatsapp_message_template', 'Hi! I\'m interested in this product: {product_name} - {product_price}. {product_image}'),
    is_active: getSetting('whatsapp_enabled') === 'true'
  } : null

  const seoSettings: SEOSettings | null = settings.site_title ? {
    site_title: getSetting('site_title'),
    site_description: getSetting('site_description'),
    site_keywords: getSetting('site_keywords'),
    og_image: getSetting('og_image')
  } : null

  const siteSettings: SiteSettings | null = settings.site_name ? {
    site_name: getSetting('site_name'),
    site_logo: getSetting('site_logo'),
    site_favicon: getSetting('site_favicon'),
    contact_email: getSetting('contact_email'),
    contact_phone: getSetting('contact_phone'),
    social_links: {
      instagram: getSetting('social_instagram'),
      facebook: getSetting('social_facebook'),
      twitter: getSetting('social_twitter'),
      youtube: getSetting('social_youtube')
    }
  } : null

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    whatsappSettings,
    seoSettings,
    siteSettings,
    loading,
    error,
    fetchSettings,
    getSetting
  }
}