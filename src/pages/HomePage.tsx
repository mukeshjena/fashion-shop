import { useState, useEffect } from 'react'
import { 
  Star, 
  Truck, 
  Shield, 
  RotateCcw, 
  Award, 
  Users, 
  Heart, 
  ChevronRight, 
  Quote,
  Sparkles,
  Zap,
  Globe,
  Clock,
  CheckCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import useProducts from '../hooks/useProducts'
import useCategories from '../hooks/useCategories'
import useSettings from '../hooks/useSettings'
import EnhancedHeroSection from '../components/common/EnhancedHeroSection'
import ProductCard from '../components/common/ProductCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import type { Product } from '../types'

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  rating: number
  image: string
  location: string
}

interface Stat {
  icon: any
  label: string
  value: string
  description: string
  color: string
}

interface BlogPost {
  id: string
  title: string
  excerpt: string
  image: string
  date: string
  readTime: string
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Fashion Blogger',
    content: 'Absolutely love the quality and style! Every piece I\'ve ordered has exceeded my expectations. The attention to detail is remarkable.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    location: 'New York, USA'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Creative Director',
    content: 'The craftsmanship is outstanding. These pieces have become staples in my wardrobe. Highly recommend to anyone who values quality.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    location: 'London, UK'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    role: 'Stylist',
    content: 'My go-to destination for contemporary fashion. The collections are always on-trend and beautifully curated. Customer service is exceptional.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    location: 'Paris, France'
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Entrepreneur',
    content: 'Professional attire that makes a statement. The fit and finish are impeccable. Worth every penny for the quality you receive.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    location: 'Tokyo, Japan'
  }
]

const stats: Stat[] = [
  {
    icon: Users,
    label: 'Happy Customers',
    value: '50,000+',
    description: 'Satisfied customers worldwide',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Award,
    label: 'Design Awards',
    value: '25+',
    description: 'International fashion awards',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: Globe,
    label: 'Countries',
    value: '40+',
    description: 'Global shipping destinations',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Heart,
    label: 'Loved Products',
    value: '10,000+',
    description: 'Products in wishlists',
    color: 'from-pink-500 to-rose-500'
  }
]

const features = [
  {
    icon: Truck,
    title: 'Free Worldwide Shipping',
    description: 'Free shipping on orders over $100',
    color: 'bg-blue-500'
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% secure payment processing',
    color: 'bg-green-500'
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns',
    color: 'bg-purple-500'
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Handcrafted with finest materials',
    color: 'bg-yellow-500'
  },
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'Express delivery in 2-3 days',
    color: 'bg-red-500'
  },
  {
    icon: Sparkles,
    title: 'Exclusive Designs',
    description: 'Limited edition collections',
    color: 'bg-indigo-500'
  }
]

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Spring Fashion Trends 2024',
    excerpt: 'Discover the latest spring trends that will define your wardrobe this season.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    date: '2024-03-15',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Sustainable Fashion Guide',
    excerpt: 'Learn how to build a sustainable wardrobe without compromising on style.',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    date: '2024-03-10',
    readTime: '7 min read'
  },
  {
    id: '3',
    title: 'Styling Tips for Professionals',
    excerpt: 'Professional styling advice to help you make a lasting impression.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    date: '2024-03-05',
    readTime: '6 min read'
  }
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)

  const [emailSubscription, setEmailSubscription] = useState('')
  
  const { fetchFeaturedProducts } = useProducts()
  const { categories } = useCategories()
  const { whatsappSettings } = useSettings()
  
  useEffect(() => {
    loadFeaturedProducts()
  }, [])
  

  
  const loadFeaturedProducts = async () => {
    try {
      setProductsLoading(true)
      const products = await fetchFeaturedProducts(12)
      setFeaturedProducts(products)
    } catch (error) {
      console.error('Error loading featured products:', error)
    } finally {
      setProductsLoading(false)
    }
  }
  

  
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Newsletter subscription:', emailSubscription)
    setEmailSubscription('')
    // Show success message
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      {/* Enhanced Hero Section */}
      <EnhancedHeroSection />
      
      {/* Enhanced Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">
              Trusted by Fashion Enthusiasts Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              From Milan to New York, Tokyo to Paris - our fashion reaches every corner of the globe. 
              Join thousands of satisfied customers who have made us their go-to destination for premium fashion. 
              Our commitment to excellence has earned us recognition from fashion weeks, style magazines, and most importantly, our valued customers.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-full mb-6">
                    <Icon className="w-10 h-10" />
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.description}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      
      {/* Featured Categories */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">
              Shop by Category
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
              Explore our carefully curated collections designed for every style and occasion. 
              From timeless classics to cutting-edge contemporary pieces, each category represents 
              our commitment to quality, style, and innovation. Whether you're dressing for business, 
              leisure, or special occasions, find your perfect style in our diverse collections.
            </p>
            
            {/* Category showcase video */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  alt="Fashion collection showcase"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-xl font-bold mb-2">Collection Showcase 2024</h3>
                  <p className="text-sm opacity-90">Discover the stories behind our curated collections</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.slice(0, 6).map((category, index) => (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <Link to={`/products?category=${category.id}`} className="block h-96">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-200 text-sm mb-4 line-clamp-2 opacity-90">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center text-white">
                      <span className="text-sm font-medium">Explore Collection</span>
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">
              Featured Products
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Handpicked pieces that define contemporary elegance and timeless style
            </p>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredProducts.map((product, index) => (
                  <div key={product.id}>
                    <ProductCard
                      product={product}
                      whatsappSettings={whatsappSettings}
                    />
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-16">
                <Link
                  to="/products"
                  className="group relative inline-flex items-center space-x-2 px-8 py-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200"
                >
                  <span>View All Products</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      
      {/* Brand Story Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-8">
                Crafting Excellence Since 2018
              </h2>
              <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                 <p>
                   Our journey began with a simple vision: to create fashion that transcends trends and speaks to the soul. 
                   Every piece in our collection tells a story of craftsmanship, innovation, and timeless elegance. 
                   Founded by visionary designers who believed that fashion should be both beautiful and meaningful.
                 </p>
                 <p>
                   From our atelier to your wardrobe, we ensure that each garment meets the highest standards of quality and design. 
                   Our commitment to sustainability and ethical practices drives everything we do. We work exclusively with 
                   certified suppliers who share our values of fair trade, environmental responsibility, and social impact.
                 </p>
                 <p>
                   We believe that fashion is more than clothing—it's a form of self-expression, a way to tell your story 
                   without words. Join us in redefining what contemporary fashion means. Our design philosophy centers on 
                   creating pieces that empower individuals to express their unique style while making a positive impact on the world.
                 </p>
                 <p>
                   Today, we're proud to serve customers in over 40 countries, with flagship stores in major fashion capitals 
                   and a growing online presence that brings our vision to fashion enthusiasts worldwide.
                 </p>
               </div>
               

              
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  to="/about"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-300"
                >
                  <span>Learn Our Story</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Sustainable Materials</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Ethical Production</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Fashion design process"
                  className="w-full h-96 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">
              Why Choose Us
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the difference with our commitment to quality, service, and customer satisfaction
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="text-center p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg mb-6">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">
              What Our Customers Say
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Real stories from real customers who love our fashion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className="bg-gray-50 dark:bg-gray-800 p-6 sm:p-8 rounded-lg border border-gray-200 dark:border-gray-700 relative"
              >
                <Quote className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-semibold text-black dark:text-white text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Blog Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-6">
              Fashion Insights
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Stay updated with the latest trends, styling tips, and fashion news
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="p-4 sm:p-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-3 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                  <button className="text-black dark:text-white font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300 flex items-center space-x-2">
                    <span>Read More</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      
      {/* Enhanced Newsletter */}
       <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gray-900 dark:bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <Zap className="w-16 h-16 mx-auto mb-8 text-yellow-400" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-6">
              Stay in Style
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Subscribe to our newsletter and be the first to know about new collections, 
              exclusive offers, and fashion insights. Join our community of style enthusiasts.
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
              <input
                type="email"
                value={emailSubscription}
                onChange={(e) => setEmailSubscription(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
                required
              />
              <button 
                type="submit"
                className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            
            <p className="text-sm text-gray-400">
              Join 50,000+ fashion enthusiasts. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}