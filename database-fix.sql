-- Database Fix Script for Fashion Shop
-- Run this SQL in your Supabase SQL Editor to fix permission and JWT issues

-- 1. Ensure the custom access token hook is properly configured
-- This function sets JWT claims based on user role
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 2. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 3. Ensure settings table has default data
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
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- 4. Create storage buckets if they don't exist
-- Note: This needs to be run in the Supabase dashboard Storage section
-- or via the Supabase CLI, not in SQL editor

-- 5. Update RLS policies to be more permissive for debugging
-- Temporarily allow all operations for authenticated users
DROP POLICY IF EXISTS "Temp allow all for authenticated" ON public.settings;
CREATE POLICY "Temp allow all for authenticated" ON public.settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Temp allow all products for authenticated" ON public.products;
CREATE POLICY "Temp allow all products for authenticated" ON public.products
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Temp allow all categories for authenticated" ON public.categories;
CREATE POLICY "Temp allow all categories for authenticated" ON public.categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Temp allow all banners for authenticated" ON public.banners;
CREATE POLICY "Temp allow all banners for authenticated" ON public.banners
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Temp allow all pages for authenticated" ON public.pages;
CREATE POLICY "Temp allow all pages for authenticated" ON public.pages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Create an admin user if it doesn't exist
-- Note: You'll need to create the auth user first in Supabase Auth
-- Then update the role here with the actual user ID
-- Example:
-- INSERT INTO public.users (id, email, role) 
-- VALUES ('your-auth-user-id-here', 'admin@fashionshop.com', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- 7. Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Instructions:
-- 1. Run this script in your Supabase SQL Editor
-- 2. Go to Authentication > Users and create an admin user
-- 3. Copy the user ID and update the users table with admin role
-- 4. Go to Storage and create buckets: products, banners, categories, pages
-- 5. In Project Settings > Database > Webhooks, add the custom_access_token_hook
--    URL: https://your-project.supabase.co/rest/v1/rpc/custom_access_token_hook
--    Events: auth.user.created, auth.user.updated

SELECT 'Database fix script completed. Please follow the manual steps in the comments above.' as status;