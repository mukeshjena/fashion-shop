-- Fashion Shop Extended Test Data (60 Products)
-- Run this after setting up the main database schema

-- Insert Categories
INSERT INTO categories (name, slug, description, image_url, is_active, sort_order) VALUES
('Women''s Fashion', 'womens-fashion', 'Elegant and contemporary women''s clothing collection featuring dresses, tops, and formal wear', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 1),
('Men''s Fashion', 'mens-fashion', 'Sophisticated men''s clothing and accessories including suits, shirts, and casual wear', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 2),
('Accessories', 'accessories', 'Premium fashion accessories including scarves, belts, and luxury items', 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 3),
('Footwear', 'footwear', 'Stylish shoes and boots for every occasion from casual to formal', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 4),
('Bags & Purses', 'bags-purses', 'Luxury handbags, designer purses, and travel accessories', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 5),
('Jewelry', 'jewelry', 'Exquisite jewelry collection including necklaces, bracelets, and rings', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 6),
('Outerwear', 'outerwear', 'Premium coats, jackets, and seasonal outerwear for all weather', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 7),
('Activewear', 'activewear', 'High-performance athletic wear and fitness clothing', 'https://images.unsplash.com/photo-1506629905607-d9b1e5b6e4e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 8),
('Formal Wear', 'formal-wear', 'Elegant formal attire for special occasions and events', 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 9),
('Vintage Collection', 'vintage-collection', 'Curated vintage and retro-inspired fashion pieces', 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 10);

-- Insert Products using proper category references
DO $$
DECLARE
    womens_id UUID;
    mens_id UUID;
    accessories_id UUID;
    footwear_id UUID;
    bags_id UUID;
    jewelry_id UUID;
    outerwear_id UUID;
    activewear_id UUID;
    formal_id UUID;
    vintage_id UUID;
BEGIN
    SELECT id INTO womens_id FROM categories WHERE slug = 'womens-fashion';
    SELECT id INTO mens_id FROM categories WHERE slug = 'mens-fashion';
    SELECT id INTO accessories_id FROM categories WHERE slug = 'accessories';
    SELECT id INTO footwear_id FROM categories WHERE slug = 'footwear';
    SELECT id INTO bags_id FROM categories WHERE slug = 'bags-purses';
    SELECT id INTO jewelry_id FROM categories WHERE slug = 'jewelry';
    SELECT id INTO outerwear_id FROM categories WHERE slug = 'outerwear';
    SELECT id INTO activewear_id FROM categories WHERE slug = 'activewear';
    SELECT id INTO formal_id FROM categories WHERE slug = 'formal-wear';
    SELECT id INTO vintage_id FROM categories WHERE slug = 'vintage-collection';

    -- Insert Products
    INSERT INTO products (name, slug, description, price, category_id, images, videos, is_featured, is_active, sort_order, meta_title, meta_description) VALUES
    -- Women's Fashion (15 products)
    ('Elegant Silk Evening Dress', 'elegant-silk-evening-dress', 'A stunning silk evening dress perfect for special occasions. Made from premium quality silk with intricate beadwork and flowing silhouette.', 299.99, womens_id, ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 1, 'Elegant Silk Evening Dress - Premium Women''s Fashion', 'Stunning silk evening dress perfect for special occasions. Premium quality with intricate beadwork.'),
    ('Cashmere Turtleneck Sweater', 'cashmere-turtleneck-sweater', 'Luxurious cashmere turtleneck sweater that combines comfort with sophistication. Perfect for both casual and professional settings.', 189.99, womens_id, ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 2, 'Luxurious Cashmere Turtleneck Sweater', 'Premium cashmere sweater combining comfort with sophistication for any occasion.'),
    ('Designer Blazer', 'designer-blazer', 'Contemporary blazer with modern cut and premium fabric. Essential piece for professional wardrobe with versatile styling options.', 249.99, womens_id, ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 3, 'Designer Blazer - Professional Fashion', 'Contemporary blazer with modern cut. Essential for professional wardrobe.'),
    ('Floral Midi Dress', 'floral-midi-dress', 'Beautiful floral midi dress with flowing fabric and feminine silhouette. Perfect for spring and summer occasions.', 159.99, womens_id, ARRAY['https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 4, 'Floral Midi Dress - Spring Collection', 'Beautiful floral midi dress perfect for spring and summer occasions.'),
    ('Luxury Wool Coat', 'luxury-wool-coat', 'Premium wool coat with elegant design and superior warmth. Crafted from finest materials for ultimate comfort and style.', 399.99, womens_id, ARRAY['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 5, 'Luxury Wool Coat - Winter Collection', 'Premium wool coat with elegant design and superior warmth.'),
    ('Silk Blouse', 'silk-blouse', 'Elegant silk blouse with delicate details and comfortable fit. Versatile piece for office or evening wear.', 129.99, womens_id, ARRAY['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 6, 'Elegant Silk Blouse', 'Silk blouse with delicate details perfect for office or evening wear.'),
    ('Cocktail Dress', 'cocktail-dress', 'Sophisticated cocktail dress with modern design and flattering cut. Perfect for evening events and parties.', 219.99, womens_id, ARRAY['https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 7, 'Sophisticated Cocktail Dress', 'Modern cocktail dress perfect for evening events and parties.'),
    ('Cashmere Cardigan', 'cashmere-cardigan', 'Soft cashmere cardigan with elegant drape and luxurious feel. Essential layering piece for any wardrobe.', 179.99, womens_id, ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 8, 'Soft Cashmere Cardigan', 'Luxurious cashmere cardigan essential for any wardrobe.'),
    ('Wrap Dress', 'wrap-dress', 'Classic wrap dress with timeless appeal and flattering silhouette. Suitable for various occasions from casual to formal.', 139.99, womens_id, ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 9, 'Classic Wrap Dress', 'Timeless wrap dress suitable for various occasions.'),
    ('Pencil Skirt', 'pencil-skirt', 'Professional pencil skirt with perfect fit and premium fabric. Essential piece for business wardrobe.', 89.99, womens_id, ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 10, 'Professional Pencil Skirt', 'Essential pencil skirt for business wardrobe.'),
    ('Maxi Dress', 'maxi-dress', 'Flowing maxi dress with bohemian style and comfortable fit. Perfect for vacation and casual occasions.', 149.99, womens_id, ARRAY['https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 11, 'Bohemian Maxi Dress', 'Flowing maxi dress perfect for vacation and casual occasions.'),
    ('Trench Coat', 'trench-coat', 'Classic trench coat with timeless design and water-resistant fabric. Essential outerwear for any season.', 279.99, womens_id, ARRAY['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 12, 'Classic Trench Coat', 'Timeless trench coat essential for any season.'),
    ('Jumpsuit', 'elegant-jumpsuit', 'Sophisticated jumpsuit with modern cut and versatile styling. Perfect for both day and evening wear.', 199.99, womens_id, ARRAY['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 13, 'Sophisticated Jumpsuit', 'Modern jumpsuit perfect for day and evening wear.'),
    ('Wool Sweater', 'wool-sweater', 'Cozy wool sweater with classic design and superior warmth. Perfect for cold weather styling.', 119.99, womens_id, ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 14, 'Cozy Wool Sweater', 'Classic wool sweater perfect for cold weather.'),
    ('A-Line Skirt', 'a-line-skirt', 'Flattering A-line skirt with versatile styling options. Perfect for office and casual wear.', 79.99, womens_id, ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 15, 'Flattering A-Line Skirt', 'Versatile A-line skirt for office and casual wear.'),
    
    -- Men's Fashion (15 products)
    ('Premium Wool Suit', 'premium-wool-suit', 'Handcrafted premium suit made from finest wool. Tailored to perfection for the modern gentleman with impeccable attention to detail.', 899.99, mens_id, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 1, 'Premium Handcrafted Wool Suit', 'Handcrafted premium suit from finest wool. Tailored for the modern gentleman.'),
    ('Cotton Dress Shirt', 'cotton-dress-shirt', 'Premium cotton dress shirt with perfect fit and superior comfort. Essential for professional wardrobe.', 89.99, mens_id, ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 2, 'Premium Cotton Dress Shirt', 'Cotton dress shirt essential for professional wardrobe.'),
    ('Leather Jacket', 'leather-jacket', 'Genuine leather jacket with classic design and superior craftsmanship. Timeless piece that never goes out of style.', 399.99, mens_id, ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 3, 'Genuine Leather Jacket', 'Classic leather jacket with timeless design that never goes out of style.'),
    ('Cashmere Sweater', 'mens-cashmere-sweater', 'Luxurious cashmere sweater with sophisticated design and unmatched comfort. Perfect for both casual and formal occasions.', 229.99, mens_id, ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 4, 'Luxurious Men''s Cashmere Sweater', 'Sophisticated cashmere sweater for casual and formal occasions.'),
    ('Chino Pants', 'chino-pants', 'Classic chino pants with modern fit and versatile styling. Perfect for casual and smart-casual occasions.', 79.99, mens_id, ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 5, 'Classic Chino Pants', 'Modern fit chinos perfect for casual and smart-casual wear.'),
    ('Polo Shirt', 'polo-shirt', 'Premium polo shirt with classic design and superior comfort. Essential for casual and smart-casual wardrobe.', 69.99, mens_id, ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 6, 'Premium Polo Shirt', 'Classic polo shirt essential for casual wardrobe.'),
    ('Wool Blazer', 'wool-blazer', 'Sophisticated wool blazer with modern cut and premium fabric. Perfect for business and formal occasions.', 299.99, mens_id, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 7, 'Sophisticated Wool Blazer', 'Modern wool blazer perfect for business and formal occasions.'),
    ('Denim Jeans', 'denim-jeans', 'Premium denim jeans with perfect fit and superior quality. Classic piece for casual wardrobe.', 119.99, mens_id, ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 8, 'Premium Denim Jeans', 'Classic denim jeans with perfect fit and superior quality.'),
    ('Turtleneck Sweater', 'turtleneck-sweater', 'Elegant turtleneck sweater with modern design and comfortable fit. Perfect for layering and standalone wear.', 99.99, mens_id, ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 9, 'Elegant Turtleneck Sweater', 'Modern turtleneck perfect for layering and standalone wear.'),
    ('Formal Trousers', 'formal-trousers', 'Classic formal trousers with perfect tailoring and premium fabric. Essential for business wardrobe.', 129.99, mens_id, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 10, 'Classic Formal Trousers', 'Perfect tailoring essential for business wardrobe.'),
    ('Cardigan', 'mens-cardigan', 'Sophisticated cardigan with classic design and comfortable fit. Perfect for layering and casual wear.', 149.99, mens_id, ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 11, 'Sophisticated Men''s Cardigan', 'Classic cardigan perfect for layering and casual wear.'),
    ('Henley Shirt', 'henley-shirt', 'Casual henley shirt with comfortable fit and versatile styling. Perfect for weekend and casual occasions.', 59.99, mens_id, ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 12, 'Casual Henley Shirt', 'Comfortable henley perfect for weekend and casual wear.'),
    ('Vest', 'mens-vest', 'Elegant vest with classic design and premium fabric. Perfect for formal and semi-formal occasions.', 89.99, mens_id, ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 13, 'Elegant Men''s Vest', 'Classic vest perfect for formal and semi-formal occasions.'),
    ('Hoodie', 'premium-hoodie', 'Premium hoodie with comfortable fit and modern design. Perfect for casual and athletic wear.', 79.99, mens_id, ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 14, 'Premium Hoodie', 'Comfortable hoodie perfect for casual and athletic wear.'),
    ('Shorts', 'mens-shorts', 'Casual shorts with comfortable fit and versatile styling. Perfect for summer and vacation wear.', 49.99, mens_id, ARRAY['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 15, 'Casual Men''s Shorts', 'Comfortable shorts perfect for summer and vacation wear.'),
    
    -- Accessories (10 products)
    ('Silk Scarf', 'silk-scarf', 'Luxurious silk scarf with unique pattern and superior quality. Perfect accessory to elevate any outfit with sophisticated style.', 89.99, accessories_id, ARRAY['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 1, 'Luxurious Silk Scarf', 'Silk scarf with unique pattern. Perfect accessory for any outfit.'),
    ('Designer Sunglasses', 'designer-sunglasses', 'Premium sunglasses with UV protection and stylish frame. Essential summer accessory with superior lens quality.', 199.99, accessories_id, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 2, 'Designer Sunglasses with UV Protection', 'Premium sunglasses with UV protection and stylish frame.'),
    ('Leather Belt', 'leather-belt', 'Premium leather belt with classic design and superior craftsmanship. Essential accessory for any wardrobe.', 79.99, accessories_id, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 3, 'Premium Leather Belt', 'Classic leather belt essential for any wardrobe.'),
    ('Cashmere Scarf', 'cashmere-scarf', 'Soft cashmere scarf with elegant design and luxurious feel. Perfect for cold weather styling.', 129.99, accessories_id, ARRAY['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 4, 'Soft Cashmere Scarf', 'Luxurious cashmere scarf perfect for cold weather.'),
    ('Designer Hat', 'designer-hat', 'Stylish designer hat with modern design and premium materials. Perfect accessory for any season.', 69.99, accessories_id, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 5, 'Stylish Designer Hat', 'Modern designer hat perfect for any season.'),
    ('Leather Gloves', 'leather-gloves', 'Premium leather gloves with elegant design and superior comfort. Essential for cold weather styling.', 99.99, accessories_id, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 6, 'Premium Leather Gloves', 'Elegant leather gloves essential for cold weather.'),
    ('Silk Tie', 'silk-tie', 'Elegant silk tie with classic pattern and superior quality. Essential accessory for formal wear.', 59.99, accessories_id, ARRAY['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 7, 'Elegant Silk Tie', 'Classic silk tie essential for formal wear.'),
    ('Pocket Square', 'pocket-square', 'Sophisticated pocket square with elegant design and premium fabric. Perfect finishing touch for formal attire.', 39.99, accessories_id, ARRAY['https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 8, 'Sophisticated Pocket Square', 'Elegant pocket square perfect for formal attire.'),
    ('Cufflinks', 'designer-cufflinks', 'Designer cufflinks with sophisticated design and premium materials. Essential accessory for formal shirts.', 149.99, accessories_id, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 9, 'Designer Cufflinks', 'Sophisticated cufflinks essential for formal shirts.'),
    ('Wool Beanie', 'wool-beanie', 'Cozy wool beanie with modern design and superior warmth. Perfect for cold weather styling.', 49.99, accessories_id, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 10, 'Cozy Wool Beanie', 'Modern wool beanie perfect for cold weather.'),
    
    -- Footwear (10 products)
    ('Italian Leather Shoes', 'italian-leather-shoes', 'Handcrafted Italian leather shoes with exceptional quality and comfort. Perfect for formal occasions and business wear.', 349.99, footwear_id, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 1, 'Handcrafted Italian Leather Shoes', 'Italian leather shoes with exceptional quality. Perfect for formal occasions.'),
    ('Premium Sneakers', 'premium-sneakers', 'Comfortable premium sneakers with modern design and superior materials. Perfect for casual wear and athletic activities.', 159.99, footwear_id, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 2, 'Premium Comfortable Sneakers', 'Premium sneakers perfect for casual wear. Style meets functionality.'),
    ('Ankle Boots', 'ankle-boots', 'Stylish ankle boots with modern design and comfortable fit. Perfect for transitional seasons and versatile styling.', 199.99, footwear_id, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 3, 'Stylish Ankle Boots', 'Modern ankle boots perfect for transitional seasons.'),
    ('Loafers', 'leather-loafers', 'Classic leather loafers with sophisticated design and superior comfort. Perfect for business and casual wear.', 229.99, footwear_id, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 4, 'Classic Leather Loafers', 'Sophisticated loafers perfect for business and casual wear.'),
    ('High Heels', 'designer-high-heels', 'Elegant high heels with sophisticated design and comfortable fit. Perfect for formal occasions and evening wear.', 179.99, footwear_id, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 5, 'Elegant Designer High Heels', 'Sophisticated high heels perfect for formal occasions.'),
    ('Canvas Shoes', 'canvas-shoes', 'Casual canvas shoes with comfortable fit and versatile styling. Perfect for everyday wear and casual occasions.', 79.99, footwear_id, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 6, 'Casual Canvas Shoes', 'Comfortable canvas shoes perfect for everyday wear.'),
    ('Sandals', 'leather-sandals', 'Comfortable leather sandals with modern design and superior quality. Perfect for summer and vacation wear.', 99.99, footwear_id, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 7, 'Comfortable Leather Sandals', 'Modern leather sandals perfect for summer wear.'),
    ('Hiking Boots', 'hiking-boots', 'Durable hiking boots with superior traction and weather resistance. Perfect for outdoor activities and adventures.', 189.99, footwear_id, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 8, 'Durable Hiking Boots', 'Superior hiking boots perfect for outdoor adventures.'),
    ('Ballet Flats', 'ballet-flats', 'Elegant ballet flats with comfortable fit and timeless design. Perfect for everyday wear and professional settings.', 89.99, footwear_id, ARRAY['https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 9, 'Elegant Ballet Flats', 'Timeless ballet flats perfect for everyday wear.'),
    ('Running Shoes', 'running-shoes', 'High-performance running shoes with advanced cushioning and support. Perfect for athletic activities and fitness.', 139.99, footwear_id, ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 10, 'High-Performance Running Shoes', 'Advanced running shoes perfect for athletic activities.'),
    
    -- Bags & Purses (5 products)
    ('Designer Handbag', 'designer-handbag', 'Elegant designer handbag made from premium leather with sophisticated design. Spacious and stylish for everyday use.', 449.99, bags_id, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 1, 'Elegant Designer Handbag', 'Premium leather handbag. Spacious and stylish for everyday use.'),
    ('Travel Backpack', 'travel-backpack', 'Durable and stylish travel backpack with multiple compartments and superior organization. Perfect for business and leisure travel.', 129.99, bags_id, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 2, 'Stylish Travel Backpack', 'Durable travel backpack with multiple compartments for business and leisure.'),
    ('Evening Clutch', 'evening-clutch', 'Sophisticated evening clutch with elegant design and premium materials. Perfect for formal events and special occasions.', 179.99, bags_id, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 3, 'Sophisticated Evening Clutch', 'Elegant clutch perfect for formal events and special occasions.'),
    ('Crossbody Bag', 'crossbody-bag', 'Versatile crossbody bag with modern design and practical functionality. Perfect for everyday use and travel.', 99.99, bags_id, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 4, 'Versatile Crossbody Bag', 'Modern crossbody bag perfect for everyday use and travel.'),
    ('Tote Bag', 'leather-tote-bag', 'Spacious leather tote bag with classic design and superior quality. Perfect for work and everyday activities.', 199.99, bags_id, ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 5, 'Spacious Leather Tote Bag', 'Classic leather tote perfect for work and everyday activities.'),
    
    -- Jewelry (5 products)
    ('Diamond Necklace', 'diamond-necklace', 'Exquisite diamond necklace with 18k gold setting and superior craftsmanship. Perfect for special occasions and celebrations.', 1299.99, jewelry_id, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 1, 'Exquisite Diamond Necklace', 'Diamond necklace with 18k gold setting. Perfect for special occasions.'),
    ('Silver Bracelet', 'silver-bracelet', 'Elegant sterling silver bracelet with modern design and superior craftsmanship. Versatile piece for any jewelry collection.', 89.99, jewelry_id, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 2, 'Sterling Silver Bracelet', 'Sterling silver bracelet with modern design. Versatile jewelry piece.'),
    ('Gold Earrings', 'gold-earrings', 'Beautiful 14k gold earrings with classic design and superior quality. Timeless elegance for everyday wear.', 199.99, jewelry_id, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], false, true, 3, '14k Gold Classic Earrings', '14k gold earrings with classic design. Timeless elegance for everyday wear.'),
    ('Pearl Necklace', 'pearl-necklace', 'Classic pearl necklace with lustrous pearls and elegant design. Perfect for formal occasions and timeless style.', 299.99, jewelry_id, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 4, 'Classic Pearl Necklace', 'Lustrous pearl necklace perfect for formal occasions.'),
    ('Diamond Ring', 'diamond-ring', 'Stunning diamond ring with brilliant cut diamond and platinum setting. Perfect for engagements and special occasions.', 2499.99, jewelry_id, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'], ARRAY[]::text[], true, true, 5, 'Stunning Diamond Ring', 'Brilliant cut diamond ring perfect for engagements.');
END $$;

-- Insert Banners
INSERT INTO banners (title, subtitle, image_url, video_url, link_url, button_text, is_active, sort_order) VALUES
('New Collection 2024', 'Discover the latest trends in contemporary fashion with our exclusive new arrivals', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', NULL, '/products', 'Shop Now', true, 1),
('Summer Sale', 'Up to 50% off on selected premium items - Limited time offer', 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', NULL, '/products?sale=true', 'Shop Sale', true, 2),
('Premium Quality', 'Handcrafted with finest materials and attention to detail', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', NULL, '/about', 'Learn More', true, 3),
('Sustainable Fashion', 'Eco-friendly materials and ethical production practices', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', NULL, '/about', 'Our Mission', true, 4);

-- Insert Settings
INSERT INTO settings (key, value) VALUES
-- Site Settings
('site_name', 'Fashion Shop'),
('site_logo', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'),
('site_favicon', '/favicon.ico'),
('contact_email', 'info@fashionshop.com'),
('contact_phone', '+1 (555) 123-4567'),
('contact_address', '123 Fashion Avenue, Style District, New York, NY 10001'),

-- Social Media
('social_instagram', 'https://instagram.com/fashionshop'),
('social_facebook', 'https://facebook.com/fashionshop'),
('social_twitter', 'https://twitter.com/fashionshop'),
('social_youtube', 'https://youtube.com/fashionshop'),
('social_pinterest', 'https://pinterest.com/fashionshop'),
('social_tiktok', 'https://tiktok.com/@fashionshop'),

-- WhatsApp Settings
('whatsapp_phone_number', '+1234567890'),
('whatsapp_message_template', 'Hi! I''m interested in this product: {product_name} - Price: {product_price}. Can you provide more details about sizing, availability, and shipping?'),
('whatsapp_is_active', 'true'),

-- SEO Settings
('site_title', 'Fashion Shop - Contemporary Fashion & Premium Style'),
('site_description', 'Discover contemporary fashion with timeless elegance. Premium quality clothing, accessories, and jewelry for the modern lifestyle. Shop the latest trends from top designers.'),
('site_keywords', 'fashion, clothing, accessories, style, contemporary, premium, luxury, designer, trendy, elegant'),
('og_image', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),

-- Business Settings
('business_hours', 'Monday - Friday: 9:00 AM - 8:00 PM, Saturday: 10:00 AM - 6:00 PM, Sunday: 12:00 PM - 5:00 PM'),
('shipping_policy', 'Free shipping on orders over $100. Express delivery available.'),
('return_policy', '30-day hassle-free returns. Items must be in original condition.'),
('privacy_policy_url', '/privacy-policy'),
('terms_of_service_url', '/terms-of-service');

-- Create Admin User (Password: admin123)
-- Note: In production, use a secure password hash
-- The ID will be auto-generated as UUID by the database
INSERT INTO users (id, email, role, created_at, updated_at) VALUES
(uuid_generate_v4(), 'admin@fashionshop.com', 'admin', NOW(), NOW());

-- Insert sample pages
INSERT INTO pages (slug, title, content, meta_title, meta_description, is_active) VALUES
('privacy-policy', 'Privacy Policy', '<h1>Privacy Policy</h1><p>Your privacy is important to us. This privacy policy explains how we collect, use, and protect your information when you visit our website and make purchases.</p><h2>Information We Collect</h2><p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us.</p>', 'Privacy Policy - Fashion Shop', 'Learn about our privacy policy and how we protect your personal information.', true),
('terms-of-service', 'Terms of Service', '<h1>Terms of Service</h1><p>Please read these terms of service carefully before using our website and making purchases.</p><h2>Acceptance of Terms</h2><p>By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.</p>', 'Terms of Service - Fashion Shop', 'Read our terms of service and conditions for using our website.', true),
('shipping-info', 'Shipping Information', '<h1>Shipping Information</h1><p>We offer worldwide shipping with various delivery options to suit your needs.</p><h2>Shipping Options</h2><ul><li>Standard Shipping (5-7 business days)</li><li>Express Shipping (2-3 business days)</li><li>Overnight Shipping (1 business day)</li></ul>', 'Shipping Information - Fashion Shop', 'Learn about our shipping options and delivery times.', true),
('size-guide', 'Size Guide', '<h1>Size Guide</h1><p>Find your perfect fit with our comprehensive size guide.</p><h2>Women''s Clothing</h2><p>Detailed measurements and sizing charts for all women''s clothing items.</p><h2>Men''s Clothing</h2><p>Complete sizing information for men''s apparel and accessories.</p>', 'Size Guide - Fashion Shop', 'Find your perfect fit with our comprehensive size guide.', true);

-- Success message
SELECT 'Extended test data inserted successfully!' as message;
SELECT 'Admin credentials: admin@fashionshop.com / admin123' as admin_info;
SELECT 'Categories: ' || COUNT(*) || ' inserted' as categories_count FROM categories;
SELECT 'Products: ' || COUNT(*) || ' inserted' as products_count FROM products;
SELECT 'Banners: ' || COUNT(*) || ' inserted' as banners_count FROM banners;
SELECT 'Settings: ' || COUNT(*) || ' inserted' as settings_count FROM settings;
SELECT 'Pages: ' || COUNT(*) || ' inserted' as pages_count FROM pages;