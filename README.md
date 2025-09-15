# Fashion Shop - Modern Clothing Showcase

A modern fashion clothing showcase website built with React, Vite, TypeScript, and Supabase. Features a cinematic homepage with GSAP animations, Three.js 3D visuals, and a comprehensive admin panel for content management.

## Features

- 🎨 **Modern Design**: Clean black/white/grayscale aesthetic with no shadows
- 🎬 **Cinematic Experience**: GSAP animations, parallax scrolling, Three.js 3D visuals
- 📱 **Responsive**: Mobile-first design with smooth performance
- 🔐 **Admin Panel**: Complete content management system
- 🛍️ **Product Catalog**: Search, filters, pagination with SEO-friendly URLs
- 💬 **WhatsApp Integration**: Direct product inquiries via WhatsApp
- ⚡ **Performance**: Lazy loading, shimmer placeholders, optimized images
- 🔍 **SEO Optimized**: Slug-based routing, meta tags, structured data

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, GSAP, Framer Motion
- **3D Graphics**: Three.js, React Three Fiber
- **Backend**: Supabase (Auth, Database, Storage)
- **Routing**: React Router DOM
- **State Management**: React Hooks, Context API
- **Deployment**: Vercel

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fashion-shop
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the `supabase-setup.sql` file
3. Go to Storage and create buckets: `products`, `banners`, `categories`, `pages`
4. Set up storage policies as described in the SQL file comments
5. Create your admin user in Authentication

### 3. Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_NAME=Fashion Shop
VITE_SITE_URL=http://localhost:5173
VITE_WHATSAPP_NUMBER=+1234567890
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the website.
Visit `http://localhost:5173/admin/login` to access the admin panel.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   ├── layout/         # Layout components
│   └── common/         # Common components
├── pages/              # Public pages
├── admin/              # Admin panel
│   ├── components/     # Admin-specific components
│   └── pages/          # Admin pages
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── lib/                # Third-party configurations
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## Database Schema

### Tables

- **users**: User profiles and roles
- **categories**: Product categories
- **products**: Product catalog
- **banners**: Homepage banners
- **pages**: Dynamic pages (About, Contact)
- **settings**: Site configuration

### Storage Buckets

- **products**: Product images and videos
- **banners**: Banner media
- **categories**: Category images
- **pages**: Page content media

## Admin Panel Features

- **Dashboard**: Overview and analytics
- **Products**: CRUD operations with image/video upload
- **Categories**: Category management
- **Banners**: Homepage banner management
- **Pages**: Dynamic page content editor
- **Settings**: Site configuration, WhatsApp, SEO settings

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```
