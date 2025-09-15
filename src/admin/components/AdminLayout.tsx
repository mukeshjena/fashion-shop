import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  Image, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useConfirm } from '../../hooks/useConfirm'
import { cn } from '../../utils'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { confirm } = useConfirm()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, description: 'Overview & Analytics' },
    { name: 'Products', href: '/admin/products', icon: Package, description: 'Manage Products' },
    { name: 'Categories', href: '/admin/categories', icon: FolderOpen, description: 'Product Categories' },
    { name: 'Banners', href: '/admin/banners', icon: Image, description: 'Hero Banners' },
    { name: 'Pages', href: '/admin/pages', icon: FileText, description: 'Content Pages' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, description: 'System Settings' },
  ]

  const handleSignOut = async () => {
    const confirmed = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your admin account?',
      type: 'info',
      confirmText: 'Sign Out',
      cancelText: 'Stay Signed In'
    })
    
    if (confirmed) {
      await signOut()
      navigate('/admin/login')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-72 glass-nav border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="flex flex-col h-full max-h-screen overflow-hidden">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/10">
            <Link to="/admin" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white dark:text-gray-900" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 font-display">
                  Fashion Admin
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Management Portal
                </p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-4" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className={cn(
                        'text-xs mt-0.5',
                        isActive 
                          ? 'text-gray-300 dark:text-gray-600' 
                          : 'text-gray-500 dark:text-gray-400'
                      )}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    'w-4 h-4 transition-transform duration-200',
                    isActive ? 'rotate-90' : 'group-hover:translate-x-1'
                  )} />
                </Link>
              )
            })}
          </nav>

          {/* User info and logout - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-white/10 p-6">
            <div className="glass-card p-4 rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white dark:text-gray-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {user?.role} • Online
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-72 flex flex-col min-h-screen">
        {/* Mobile menu button - positioned at top right */}
        <div className="lg:hidden fixed top-4 right-4 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 bg-white dark:bg-gray-900 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}