import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './components/ui/NotificationSystem'
import { ConfirmProvider } from './hooks/useConfirm'
import Layout from './components/layout/Layout'
import AdminLayout from './admin/components/AdminLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import ConnectionMonitor from './components/common/ConnectionMonitor'
import ScrollToTop from './components/common/ScrollToTop'

// Public Pages
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoryPage from './pages/CategoryPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'

// Admin Pages
import AdminLogin from './admin/pages/AdminLogin'
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminProducts from './admin/pages/AdminProducts'
import AdminCategories from './admin/pages/AdminCategories'
import AdminBanners from './admin/pages/AdminBanners'
import AdminPages from './admin/pages/AdminPages'
import AdminSettings from './admin/pages/AdminSettings'

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider position="top-right">
        <ConfirmProvider>
          <AuthProvider>
            <Router>
              <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="category/:slug" element={<CategoryPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
          
              {/* Connection Monitor - Always visible */}
              <ConnectionMonitor />
            </Router>
          </AuthProvider>
        </ConfirmProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}

export default App
