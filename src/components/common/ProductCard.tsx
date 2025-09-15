import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Eye } from 'lucide-react'
import { formatPrice, generateWhatsAppUrl } from '../../utils'
import useImageLoader from '../../hooks/useImageLoader'
import type { Product, WhatsAppSettings } from '../../types'

interface ProductCardProps {
  product: Product
  whatsappSettings?: WhatsAppSettings | null
  className?: string
}

export default function ProductCard({ product, whatsappSettings, className = '' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  // Removed isLiked state - replaced with WhatsApp inquiry
  
  const primaryImage = product.images?.[currentImageIndex] || product.images?.[0]
  const { loaded, loading, error } = useImageLoader(primaryImage || '')
  
  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const whatsappUrl = generateWhatsAppUrl(
      whatsappSettings?.phone_number || '+1234567890',
      whatsappSettings?.message_template || 'Hi! I\'m interested in this product: {product_name} - {product_price}',
      product.name,
      product.price,
      primaryImage
    )
    
    window.open(whatsappUrl, '_blank')
  }
  
  const handleImageHover = () => {
    if (product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const isListView = className.includes('flex')
  
  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
        isListView ? 'flex flex-row h-48' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Product Image */}
        <div className={`relative overflow-hidden ${
          isListView ? 'w-48 h-48 flex-shrink-0' : 'aspect-w-3 aspect-h-4'
        }`}>
          {loading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Image not available</span>
            </div>
          )}
          
          {primaryImage && loaded && (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-64 object-cover"
              onMouseEnter={handleImageHover}
            />
          )}
          
          {/* Overlay Actions */}
          <div className={`absolute inset-0 bg-black/10 dark:bg-black/20 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute top-4 right-4">
              {/* Quick View Button */}
              <button
                className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
            
            {/* WhatsApp Button */}
            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={handleWhatsAppClick}
                className={`w-full bg-green-600 dark:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-green-700 dark:hover:bg-green-600 ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </button>
            </div>
          </div>
          
          {/* Featured Badge */}
          {product.is_featured && (
            <div className="absolute top-4 left-4">
              <span className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-2 py-1 rounded-lg">
                Featured
              </span>
            </div>
          )}
          
          {/* Image Indicators */}
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-white'
                      : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className={`p-4 ${isListView ? 'flex-1 flex flex-col justify-between' : ''}`}>
          <div className="mb-2">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
              {product.name}
            </h3>
            {product.category && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {product.category.name}
              </p>
            )}
          </div>
          
          <div className={`flex items-center ${isListView ? 'flex-col items-start space-y-2' : 'justify-between'}`}>
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatPrice(product.price)}
            </span>
            
            {/* Rating placeholder */}
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < 4 ? 'bg-yellow-400' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {product.description && (
            <p className={`text-sm text-gray-600 dark:text-gray-400 mt-2 ${
              isListView ? 'line-clamp-3' : 'line-clamp-2'
            }`}>
              {product.description}
            </p>
          )}
          
          {isListView && (
            <div className="mt-3">
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Inquire on WhatsApp</span>
              </button>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}