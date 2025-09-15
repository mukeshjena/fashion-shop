import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'
import { 
  ArrowLeft, 
  Share2, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Zap,
  X
} from 'lucide-react'
import useProducts from '../hooks/useProducts'
import useSettings from '../hooks/useSettings'
import useImageLoader from '../hooks/useImageLoader'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProductCard from '../components/common/ProductCard'
import { formatPrice, generateWhatsAppUrl } from '../utils'
import type { Product } from '../types'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  // State
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  // Removed isLiked state - replaced with WhatsApp inquiry
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [showImageModal, setShowImageModal] = useState(false)
  
  // Refs
  const imageRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  
  // Hooks
  const { fetchProductBySlug, fetchProductsByCategory } = useProducts()
  const { whatsappSettings } = useSettings()
  const { loading: imageLoading } = useImageLoader(
    product?.images?.[currentImageIndex] || ''
  )
  
  useEffect(() => {
    if (slug) {
      loadProduct()
    }
  }, [slug])
  
  useEffect(() => {
    if (product) {
      loadRelatedProducts()
      // GSAP animations
      const tl = gsap.timeline()
      
      if (imageRef.current) {
        tl.fromTo(imageRef.current,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }
        )
      }
      
      if (detailsRef.current) {
        tl.fromTo(detailsRef.current,
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.6'
        )
      }
    }
  }, [product])
  
  const loadProduct = async () => {
    if (!slug) return
    
    try {
      setLoading(true)
      const productData = await fetchProductBySlug(slug)
      if (productData) {
        setProduct(productData)
        // Set SEO meta tags
        document.title = productData.meta_title || `${productData.name} | Fashion Shop`
        
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
          metaDescription.setAttribute('content', productData.meta_description || productData.description || '')
        }
      } else {
        navigate('/products', { replace: true })
      }
    } catch (error) {
      console.error('Error loading product:', error)
      navigate('/products', { replace: true })
    } finally {
      setLoading(false)
    }
  }
  
  const loadRelatedProducts = async () => {
    if (!product?.category_id) return
    
    try {
      const related = await fetchProductsByCategory(product.category_id, 4)
      setRelatedProducts(related.filter((p: Product) => p.id !== product.id))
    } catch (error) {
      console.error('Error loading related products:', error)
    }
  }
  
  const handleImageChange = (index: number) => {
    setCurrentImageIndex(index)
  }
  
  const handlePrevImage = () => {
    if (!product?.images) return
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    )
  }
  
  const handleNextImage = () => {
    if (!product?.images) return
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    )
  }
  
  const handleWhatsAppEnquiry = () => {
    if (!product || !whatsappSettings?.is_active || !whatsappSettings.phone_number) {
      console.warn('WhatsApp settings not configured')
      return
    }
    
    const whatsappUrl = generateWhatsAppUrl(
      whatsappSettings.phone_number,
      whatsappSettings.message_template,
      product.name,
      product.price,
      product.images?.[currentImageIndex]
    )
    
    window.open(whatsappUrl, '_blank')
  }
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }
  
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Breadcrumb */}
      <nav className="bg-gray-50 dark:bg-gray-900 py-4 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">
              Products
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link 
                  to={`/products?category=${product.category.id}`}
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-black dark:text-white font-medium">{product.name}</span>
          </div>
        </div>
      </nav>
      
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>
      
      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div ref={imageRef} className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-w-4 aspect-h-5 bg-gray-100 rounded-lg overflow-hidden group">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LoadingSpinner size="md" />
                </div>
              )}
              
              {product.images && product.images.length > 0 && (
                <>
                  <img
                    src={product.images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
                    onClick={() => setShowImageModal(true)}
                  />
                  
                  {/* Image Navigation */}
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex
                        ? 'border-black'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div ref={detailsRef} className="space-y-6">
            {/* Header */}
            <div>
              {product.category && (
                <p className="text-sm text-gray-600 mb-2">{product.category.name}</p>
              )}
              <h1 className="text-3xl md:text-4xl font-display font-bold text-black mb-4">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.0) • 24 reviews</span>
              </div>
              
              <div className="text-3xl font-bold text-black mb-6">
                {formatPrice(product.price)}
              </div>
            </div>
            
            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-black mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
            
            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-3">Size</h3>
              <div className="grid grid-cols-6 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3 border rounded-md text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={handleWhatsAppEnquiry}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-semibold flex items-center justify-center space-x-3 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                <MessageCircle className="w-6 h-6" />
                <span>Inquire on WhatsApp</span>
              </button>
              
              <button
                onClick={handleShare}
                className="w-full py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center justify-center space-x-2 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share Product</span>
              </button>
            </div>
            
            {/* Features */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Secure Payment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Easy Returns</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-display font-bold text-black mb-4">
                You Might Also Like
              </h2>
              <p className="text-gray-600">
                Discover more products from our collection
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <ProductCard
                    product={relatedProduct}
                    whatsappSettings={whatsappSettings}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && product.images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
              
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}