import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import useSettings from '../../hooks/useSettings'
import { useEffect } from 'react'

export default function Layout() {
  const { seoSettings, siteSettings } = useSettings()

  useEffect(() => {
    // Update document title and meta tags
    if (seoSettings?.site_title) {
      document.title = seoSettings.site_title
    }
    
    if (seoSettings?.site_description) {
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', seoSettings.site_description)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = seoSettings.site_description
        document.head.appendChild(meta)
      }
    }

    if (seoSettings?.site_keywords) {
      const metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', seoSettings.site_keywords)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'keywords'
        meta.content = seoSettings.site_keywords
        document.head.appendChild(meta)
      }
    }

    // Update favicon
    if (siteSettings?.site_favicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (favicon) {
        favicon.href = siteSettings.site_favicon
      }
    }
  }, [seoSettings, siteSettings])

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}