-- Fashion Shop Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create banners table
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  video_url TEXT,
  link_url TEXT,
  button_text TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pages table (for About, Contact, etc.)
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_name_gin ON public.products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_description_gin ON public.products USING gin(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON public.banners(is_active);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_is_active ON public.pages(is_active);
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update users" ON public.users;
DROP POLICY IF EXISTS "Allow user creation" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin' OR
    auth.uid() = id
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Allow user creation" ON public.users
  FOR INSERT WITH CHECK (true);

-- Categories table policies (public read, admin write)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can view all categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all categories" ON public.categories
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Products table policies (public read, admin write)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;

CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Banners table policies (public read, admin write)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can view all banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;

CREATE POLICY "Anyone can view active banners" ON public.banners
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all banners" ON public.banners
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can manage banners" ON public.banners
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Pages table policies (public read, admin write)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active pages" ON public.pages;
DROP POLICY IF EXISTS "Admins can view all pages" ON public.pages;
DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;

CREATE POLICY "Anyone can view active pages" ON public.pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all pages" ON public.pages
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Admins can manage pages" ON public.pages
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Settings table policies (public read, admin write)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;
DROP POLICY IF EXISTS "Admins can manage settings" ON public.settings;

CREATE POLICY "Anyone can view settings" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Drop existing functions and triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.custom_access_token_hook(jsonb);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set JWT claims based on user role
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Get the user's role from the users table
  SELECT role INTO user_role
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;
  
  -- Set the claims
  claims := event->'claims';
  
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{role}', to_jsonb('user'));
  END IF;
  
  -- Update the event with new claims
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO service_role;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('site_name', 'Fashion Shop'),
  ('site_description', 'Modern fashion clothing showcase'),
  ('site_logo', ''),
  ('site_favicon', ''),
  ('contact_email', 'info@fashionshop.com'),
  ('contact_phone', '+1234567890'),
  ('whatsapp_phone_number', '+1234567890'),
  ('whatsapp_message_template', 'Hi! I''m interested in this product: {product_name} - {product_price}. {product_image}'),
  ('whatsapp_enabled', 'true'),
  ('social_instagram', ''),
  ('social_facebook', ''),
  ('social_twitter', ''),
  ('social_youtube', ''),
  ('site_title', 'Fashion Shop - Modern Clothing'),
  ('site_keywords', 'fashion, clothing, modern, style'),
  ('og_image', '')
ON CONFLICT (key) DO NOTHING;

-- Insert default pages
INSERT INTO public.pages (slug, title, content, meta_title, meta_description) VALUES
  ('about', 'About Us', '<h1>About Our Fashion Shop</h1><p>Welcome to our modern fashion clothing showcase. We curate the finest collection of contemporary fashion pieces.</p>', 'About Us - Fashion Shop', 'Learn more about our fashion shop and our commitment to modern style.'),
  ('contact', 'Contact Us', '<h1>Contact Us</h1><p>Get in touch with us for any inquiries about our products or services.</p>', 'Contact Us - Fashion Shop', 'Contact our fashion shop for inquiries about products and services.')
ON CONFLICT (slug) DO NOTHING;

-- Storage bucket policies (run these in Supabase Dashboard > Storage)
-- Create buckets: 'products', 'banners', 'categories', 'pages'
-- Set policies for public read access and admin write access

/*
Storage Bucket Setup (Run in Supabase Dashboard):

1. Go to Storage > Buckets
2. Create the following buckets:
   - products (for product images/videos)
   - banners (for banner images/videos)
   - categories (for category images)
   - pages (for page content images)

3. For each bucket, set these policies:

Public Read Policy:
```sql
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'bucket_name');
```

Admin Upload Policy:
```sql
CREATE POLICY "Admin upload access" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'bucket_name' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

Admin Update Policy:
```sql
CREATE POLICY "Admin update access" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'bucket_name' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

Admin Delete Policy:
```sql
CREATE POLICY "Admin delete access" ON storage.objects
FOR DELETE USING (
  bucket_id = 'bucket_name' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

Replace 'bucket_name' with: products, banners, categories, pages
*/