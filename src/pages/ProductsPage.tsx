import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Grid, List, X, SlidersHorizontal } from 'lucide-react'
import useProducts from '../hooks/useProducts'
import useCategories from '../hooks/useCategories'
import useSettings from '../hooks/useSettings'
import useDebounce from '../hooks/useDebounce'
import ProductCard from '../components/common/ProductCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { cn } from '../utils'


interface FilterState {
  category: string
  priceRange: [number, number]
  sortBy: 'name' | 'price_asc' | 'price_desc' | 'newest' | 'featured'
  inStock: boolean
}

const ITEMS_PER_PAGE = 12
const PRICE_RANGES = [
  { label: 'All Prices', value: [0, 10000] as [number, number] },
  { label: 'Under $50', value: [0, 50] as [number, number] },
  { label: '$50 - $100', value: [50, 100] as [number, number] },
  { label: '$100 - $200', value: [100, 200] as [number, number] },
  { label: '$200 - $500', value: [200, 500] as [number, number] },
  { label: 'Over $500', value: [500, 10000] as [number, number] },
]

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Name A-Z', value: 'name' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || '',
    priceRange: [0, 10000],
    sortBy: (searchParams.get('sort') as FilterState['sortBy']) || 'featured',
    inStock: true
  })
  
  // Hooks
  const { products, loading, fetchProducts, searchProducts, meta } = useProducts()
  const { categories } = useCategories()
  const { whatsappSettings } = useSettings()
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  
  // Effects
  useEffect(() => {
    loadProducts()
  }, [debouncedSearchTerm, filters, currentPage])
  
  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams()
    if (debouncedSearchTerm) params.set('search', debouncedSearchTerm)
    if (filters.category) params.set('category', filters.category)
    if (filters.sortBy !== 'featured') params.set('sort', filters.sortBy)
    if (currentPage > 1) params.set('page', currentPage.toString())
    
    setSearchParams(params, { replace: true })
  }, [debouncedSearchTerm, filters, currentPage, setSearchParams])
  
  const loadProducts = async () => {
    try {
      if (debouncedSearchTerm) {
        await searchProducts(debouncedSearchTerm)
      } else {
        // Create filters object for the hook
        const productFilters = {
          category: filters.category || undefined,
          search: debouncedSearchTerm || undefined,
          minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
          maxPrice: filters.priceRange[1] < 10000 ? filters.priceRange[1] : undefined,
          // Remove featured filter to show all products
          sortBy: (filters.sortBy === 'featured' ? 'sort_order' : 
                  filters.sortBy === 'newest' ? 'created_at' :
                  filters.sortBy === 'name' ? 'name' :
                  filters.sortBy === 'price_asc' ? 'price' :
                  filters.sortBy === 'price_desc' ? 'price' : 'sort_order') as 'name' | 'price' | 'created_at' | undefined,
          sortOrder: (filters.sortBy === 'price_desc' ? 'desc' : 'asc') as 'asc' | 'desc'
        }
        
        await fetchProducts(productFilters, currentPage, ITEMS_PER_PAGE, true) // Include inactive products
      }
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }
  
  // Use server-side pagination from useProducts hook
  const totalPages = meta?.totalPages || 1
  const totalItems = meta?.total || 0
  
  // Products are already paginated from the server
  const paginatedProducts = products
  
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }
  
  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 10000],
      sortBy: 'featured',
      inStock: true
    })
    setSearchTerm('')
    setCurrentPage(1)
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const selectedCategory = categories.find(cat => cat.id === filters.category)
  const hasActiveFilters = filters.category || searchTerm || filters.priceRange[0] > 0 || filters.priceRange[1] < 10000
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
              {selectedCategory ? selectedCategory.name : 'All Products'}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {selectedCategory 
                ? selectedCategory.description || `Discover our ${selectedCategory.name.toLowerCase()} collection`
                : 'Discover our complete collection of contemporary fashion'
              }
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Filters and Search */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 lg:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Filter and View Controls */}
            <div className="flex items-center space-x-4">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors",
                  showFilters || hasActiveFilters
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-xs px-1.5 py-0.5 rounded">
                    {[filters.category, searchTerm, filters.priceRange[0] > 0 || filters.priceRange[1] < 10000].filter(Boolean).length}
                  </span>
                )}
              </button>
              
              {/* Sort */}
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              {/* View Mode */}
              <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'grid'
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'list'
                      ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-300">
            <span>
              Showing {paginatedProducts.length} of {totalItems} products
              {searchTerm && ` for "${searchTerm}"`}
            </span>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-gray-900 dark:text-gray-100 hover:underline font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-64 flex-shrink-0 hidden lg:block"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 sticky top-32">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Filters</h3>
                  
                  {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Categories</h4>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          checked={!filters.category}
                          onChange={() => handleFilterChange('category', '')}
                          className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 bg-white dark:bg-gray-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">All Categories</span>
                      </label>
                      {categories.map(category => (
                        <label key={category.id} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            checked={filters.category === category.id}
                            onChange={() => handleFilterChange('category', category.id)}
                            className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 bg-white dark:bg-gray-700"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Price Range</h4>
                    <div className="space-y-2">
                      {PRICE_RANGES.map((range, index) => (
                        <label key={index} className="flex items-center">
                          <input
                            type="radio"
                            name="priceRange"
                            checked={filters.priceRange[0] === range.value[0] && filters.priceRange[1] === range.value[1]}
                            onChange={() => handleFilterChange('priceRange', range.value)}
                            className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 bg-white dark:bg-gray-700"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Availability */}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Availability</h4>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-500 bg-white dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">In Stock Only</span>
                    </label>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
          
          {/* Products Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : paginatedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchTerm 
                    ? `No products match your search for "${searchTerm}"`
                    : 'No products match your current filters'
                  }
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <>
                {/* Products */}
                <motion.div
                  layout
                  className={cn(
                    "grid gap-6",
                    viewMode === 'grid'
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  )}
                >
                  <AnimatePresence>
                    {paginatedProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ProductCard
                          product={product}
                          whatsappSettings={whatsappSettings}
                          className={viewMode === 'list' ? 'flex' : ''}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center mt-12"
                  >
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            onClick={() => handlePageChange(page)}
                            className={cn(
                              "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                              isCurrentPage
                                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            {page}
                          </button>
                        )
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </motion.div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}