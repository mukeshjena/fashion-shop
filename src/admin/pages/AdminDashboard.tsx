import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, FolderOpen, Image, FileText } from 'lucide-react'
import { adminServices } from '../../services/adminService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import DatabaseStatus from '../components/DatabaseStatus'

interface DashboardStats {
  products: number
  categories: number
  banners: number
  pages: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [productsResult, categoriesResult, bannersResult, pagesResult] = await Promise.all([
        adminServices.products.getAll(),
        adminServices.categories.getAll(),
        adminServices.banners.getAll(),
        adminServices.pages.getAll()
      ])

      setStats({
        products: productsResult.data?.length || 0,
        categories: categoriesResult.data?.length || 0,
        banners: bannersResult.data?.length || 0,
        pages: pagesResult.data?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const statCards = [
    {
      name: 'Products',
      value: stats?.products || 0,
      icon: Package,
      color: 'bg-blue-500',
      href: '/admin/products'
    },
    {
      name: 'Categories',
      value: stats?.categories || 0,
      icon: FolderOpen,
      color: 'bg-green-500',
      href: '/admin/categories'
    },
    {
      name: 'Banners',
      value: stats?.banners || 0,
      icon: Image,
      color: 'bg-purple-500',
      href: '/admin/banners'
    },
    {
      name: 'Pages',
      value: stats?.pages || 0,
      icon: FileText,
      color: 'bg-orange-500',
      href: '/admin/pages'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome to the Fashion Shop admin panel. Manage your content and settings from here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.name}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/products"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Package className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Add Product</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create a new product listing</p>
            </div>
          </Link>
          
          <Link
            to="/admin/categories"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <FolderOpen className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Add Category</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create a new product category</p>
            </div>
          </Link>
          
          <Link
            to="/admin/banners"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Image className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Add Banner</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create a new homepage banner</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Database Status */}
      <DatabaseStatus />

      {/* Getting Started Guide */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Set up your site settings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Configure your site name, logo, and contact information</p>
              <Link to="/admin/settings" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">Go to Settings →</Link>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Create product categories</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Organize your products with categories</p>
              <Link to="/admin/categories" className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200">Manage Categories →</Link>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Add your first products</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start building your product catalog</p>
              <Link to="/admin/products" className="text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200">Add Products →</Link>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">Customize your homepage</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Add banners and featured content</p>
              <Link to="/admin/banners" className="text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200">Manage Banners →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}