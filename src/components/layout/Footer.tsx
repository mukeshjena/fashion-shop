import { Link } from 'react-router-dom'
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone } from 'lucide-react'
import useCategories from '../../hooks/useCategories'
import useSettings from '../../hooks/useSettings'

export default function Footer() {
  const { categories } = useCategories()
  const { siteSettings } = useSettings()

  const socialIcons = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    youtube: Youtube,
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">
              {siteSettings?.site_name || 'Fashion Shop'}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Modern fashion clothing showcase featuring the finest collection of contemporary style pieces.
            </p>
            
            {/* Social Links */}
            {siteSettings?.social_links && (
              <div className="flex space-x-4">
                {Object.entries(siteSettings.social_links).map(([platform, url]) => {
                  if (!url) return null
                  const IconComponent = socialIcons[platform as keyof typeof socialIcons]
                  if (!IconComponent) return null
                  
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                      aria-label={`Follow us on ${platform}`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Categories</h3>
            <ul className="space-y-2">
              {categories.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/category/${category.slug}`}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              {categories.length > 5 && (
                <li>
                  <Link
                    to="/products"
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    View All
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              {siteSettings?.contact_email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a
                    href={`mailto:${siteSettings.contact_email}`}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {siteSettings.contact_email}
                  </a>
                </div>
              )}
              
              {siteSettings?.contact_phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a
                    href={`tel:${siteSettings.contact_phone}`}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {siteSettings.contact_phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} {siteSettings?.site_name || 'Fashion Shop'}. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                to="/privacy"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}