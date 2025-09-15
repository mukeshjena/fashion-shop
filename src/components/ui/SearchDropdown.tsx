import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import useProducts from '../../hooks/useProducts'
import useDebounce from '../../hooks/useDebounce'
import { cn } from '../../utils'
import type { Product } from '../../types'

interface SearchDropdownProps {
  isOpen: boolean
  onClose: () => void
  placeholder?: string
  className?: string
  isMobile?: boolean
}

export default function SearchDropdown({ 
  isOpen, 
  onClose, 
  placeholder = "Search products...", 
  className,
  isMobile = false 
}: SearchDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { searchProducts } = useProducts()
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm.trim().length >= 2) {
        setIsSearching(true)
        try {
          // Use the existing searchProducts function but get results differently
          const { data: products } = await supabase
            .from('products')
            .select(`
              *,
              category:categories(*)
            `)
            .ilike('name', `%${debouncedSearchTerm.trim()}%`)
            .eq('is_active', true)
            .limit(8)
            .order('name')
          
          setSearchResults(products || [])
          setShowResults(true)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }

    performSearch()
  }, [debouncedSearchTerm])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        if (!isMobile) {
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose, isMobile])

  const handleClear = () => {
    setSearchTerm('')
    setSearchResults([])
    setShowResults(false)
    if (!isMobile) {
      onClose()
    }
  }

  const handleProductClick = () => {
    setSearchTerm('')
    setSearchResults([])
    setShowResults(false)
    onClose()
  }

  if (!isOpen && !isMobile) return null

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={cn(
            "w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200",
            isMobile ? "text-base" : "text-sm"
          )}
          autoComplete="off"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (searchResults.length > 0 || isSearching) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {isSearching ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="py-2">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.slug}`}
                      onClick={handleProductClick}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      {product.images && product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {product.category?.name}
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                {searchResults.length >= 8 && (
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      to={`/products?search=${encodeURIComponent(searchTerm)}`}
                      onClick={handleProductClick}
                      className="block text-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
                    >
                      View all results for "{searchTerm}"
                    </Link>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No products found for "{searchTerm}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}