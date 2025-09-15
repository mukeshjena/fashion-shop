import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Search, User } from 'lucide-react'
// Removed useCategories import - categories section removed
import useSettings from '../../hooks/useSettings'
import ThemeToggle from '../common/ThemeToggle'
import SearchDropdown from '../ui/SearchDropdown'
import { cn } from '../../utils'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  // Removed categories hook - categories section removed
  const { siteSettings } = useSettings()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const handleSearchToggle = () => {
    setShowSearch(!showSearch)
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300',
        isScrolled
          ? 'glass-nav'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {siteSettings?.site_logo ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img
                  src={siteSettings.site_logo}
                  alt={siteSettings.site_name || 'Fashion Shop'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-white dark:text-gray-900 font-bold text-lg">
                  {(siteSettings?.site_name || 'Fashion Shop').charAt(0)}
                </span>
              </div>
            )}
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100 font-display">
              {siteSettings?.site_name || 'Fashion Shop'}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'relative px-2 py-4 text-sm font-medium transition-colors duration-200 group',
                  location.pathname === link.href
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                )}
              >
                {link.name}
                {/* Active underline */}
                <span className={cn(
                  'absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-gray-100 transition-transform duration-200',
                  location.pathname === link.href ? 'scale-x-100' : 'scale-x-0'
                )} />
                {/* Hover underline */}
                <span className={cn(
                  'absolute bottom-0 left-0 w-full h-0.5 bg-gray-400 dark:bg-gray-500 transition-transform duration-200 group-hover:scale-x-100',
                  location.pathname === link.href ? 'scale-x-0' : 'scale-x-0'
                )} />
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search */}
            {showSearch ? (
              <SearchDropdown
                isOpen={showSearch}
                onClose={() => setShowSearch(false)}
                className="w-80"
              />
            ) : (
              <button
                onClick={handleSearchToggle}
                className="p-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="Search products"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Admin Login */}
            <Link
              to="/admin"
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <User className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ease-out',
          isMenuOpen
            ? 'max-h-screen opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
        )}
      >
        <div className="px-6 py-6">
          {/* Navigation Links */}
          <div className="space-y-1 mb-6">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'relative flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 group',
                  location.pathname === link.href
                    ? 'text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="relative z-10">{link.name}</span>
                {location.pathname === link.href && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gray-900 dark:bg-gray-100 rounded-r" />
                )}
              </Link>
            ))}
          </div>
          
          {/* Actions Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {/* Mobile Search */}
            <div className="px-4">
              <SearchDropdown
                isOpen={true}
                onClose={() => {}}
                isMobile={true}
              />
            </div>
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Theme</span>
              <ThemeToggle />
            </div>
            
            {/* Admin Link */}
            <Link
              to="/admin"
              className="flex items-center space-x-3 px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">Admin Panel</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}