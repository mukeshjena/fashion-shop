# Fashion Shop - Admin Setup & Test Data

## 🔐 Admin Credentials

**Admin Login URL:** `http://localhost:5173/admin`

## 📊 Test Data Setup

### 1. Database Setup
First, make sure your Supabase database is set up with the main schema from `supabase-setup.sql`.

### 2. Insert Test Data
Run the test data SQL file to populate your database:

```sql
-- Execute the test-data.sql file in your Supabase SQL editor
-- This will insert:
-- - 6 Categories (Women's Fashion, Men's Fashion, Accessories, etc.)
-- - 15 Products with images and descriptions
-- - 3 Banners for homepage
-- - Site settings and configurations
-- - Sample pages (Privacy Policy, Terms, etc.)
```

### 3. Environment Variables
Make sure your `.env` file contains:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎨 Website Features

### ✨ Enhanced Homepage
- **Cinematic Hero Section** with animated background
- **Statistics Section** with animated counters
- **Featured Categories** with hover effects
- **Featured Products** grid (12 products)
- **Brand Story** with video integration
- **Features Section** (6 key benefits)
- **Customer Testimonials** (4 reviews)
- **Blog Section** with latest articles
- **Newsletter Subscription** with email capture

### 🌓 Dark/Light Mode
- **Simple Toggle Button** (click to switch)
- **System Theme Detection** 
- **Smooth Transitions** between themes
- **Persistent Settings** in localStorage

### 📱 Mobile Responsive
- **Mobile-first design** approach
- **Touch-friendly** interactions
- **Responsive grids** and layouts
- **Optimized typography** for all screen sizes
- **Collapsible navigation** for mobile

### 🎬 Performance Optimized
- **Lazy loading** for images
- **Optimized animations** with cleanup
- **Efficient video handling**
- **Minimal bundle size**
- **Fast loading times**

## 🛠️ Admin Panel Features

### Dashboard
- Overview statistics
- Recent activity
- Quick actions

### Product Management
- Add/Edit/Delete products
- Image upload and management
- Category assignment
- SEO optimization

### Category Management
- Create product categories
- Image and description management
- URL slug generation

### Banner Management
- Homepage banner creation
- Image and video support
- Call-to-action buttons

### Settings
- Site configuration
- WhatsApp integration
- Social media links
- SEO settings

## 🚀 Getting Started

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the website:**
   - Frontend: `http://localhost:5173/`
   - Admin Panel: `http://localhost:5173/admin`

3. **Login with admin credentials:**
   - Email: `admin@fashionshop.com`
   - Password: `admin123`

4. **Explore the features:**
   - Browse the enhanced homepage
   - Test dark/light mode toggle
   - Check mobile responsiveness
   - Access admin panel for content management

## 📝 Test Data Overview

### Categories (6)
- Women's Fashion
- Men's Fashion
- Accessories
- Footwear
- Bags & Purses
- Jewelry

### Products (15)
- Elegant Silk Dress ($299.99)
- Cashmere Sweater ($189.99)
- Premium Suit ($899.99)
- Leather Jacket ($399.99)
- Designer Handbag ($449.99)
- Diamond Necklace ($1,299.99)
- And 9 more premium items...

### Features
- All products have high-quality images
- SEO-optimized descriptions
- Proper categorization
- Featured product flags
- WhatsApp integration ready

## 🎯 Next Steps

1. **Customize Content:** Use the admin panel to update products, categories, and settings
2. **Add Real Images:** Replace demo images with actual product photos
3. **Configure WhatsApp:** Set up your WhatsApp business number
4. **SEO Optimization:** Update meta tags and descriptions
5. **Deploy:** Build and deploy to your hosting platform

## 🔧 Build for Production

```bash
# Build the application
npm run build

# The dist/ folder will contain your production-ready files
```

---

**Happy Fashion Shopping! 🛍️✨**