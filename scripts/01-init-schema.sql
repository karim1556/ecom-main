-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  specification TEXT,
  warranty TEXT,
  other_info TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2),
  category VARCHAR(100),
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (public read)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- RLS Policies for orders (users can see their own orders)
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Insert sample products
INSERT INTO products (title, description, price, category, thumbnail_url) VALUES
  ('Premium Drone X1', 'High-performance drone with 4K camera', 1299.99, 'Drones', '/placeholder.svg?height=300&width=300'),
  ('Compact Drone Pro', 'Portable and powerful drone', 799.99, 'Drones', '/placeholder.svg?height=300&width=300'),
  ('Racing Drone FPV', 'Fast racing drone with FPV camera', 599.99, 'Racing', '/placeholder.svg?height=300&width=300'),
  ('Aerial Camera Kit', 'Professional aerial imaging equipment', 1999.99, 'Cameras', '/placeholder.svg?height=300&width=300'),
  ('Mapping Drone Plus', 'Specialized for mapping and surveying', 2499.99, 'Mapping', '/placeholder.svg?height=300&width=300'),
  ('Commercial Inspection', 'Industrial inspection drone', 3999.99, 'Commercial', '/placeholder.svg?height=300&width=300'),
  ('Agricultural Sprayer', 'Crop dusting drone', 2999.99, 'Agriculture', '/placeholder.svg?height=300&width=300'),
  ('Photography Gimbal', 'Advanced 3-axis gimbal system', 499.99, 'Accessories', '/placeholder.svg?height=300&width=300'),
  ('Extended Battery Pack', 'Extended flight time battery', 199.99, 'Accessories', '/placeholder.svg?height=300&width=300'),
  ('ND Filter Set', 'Professional ND filters', 149.99, 'Accessories', '/placeholder.svg?height=300&width=300'),
  ('Carbon Propeller Set', 'High-performance propellers', 89.99, 'Accessories', '/placeholder.svg?height=300&width=300'),
  ('Professional Case', 'Protective carrying case', 299.99, 'Accessories', '/placeholder.svg?height=300&width=300');
