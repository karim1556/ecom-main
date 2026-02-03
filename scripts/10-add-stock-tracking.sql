-- Add stock tracking fields to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;
ALTER TABLE products ADD COLUMN IF NOT EXISTS track_stock BOOLEAN DEFAULT true;

-- Add comments to describe the new fields
COMMENT ON COLUMN products.stock_quantity IS 'Current stock quantity available for this product';
COMMENT ON COLUMN products.low_stock_threshold IS 'Threshold below which product is considered low stock';
COMMENT ON COLUMN products.track_stock IS 'Whether to track inventory for this product';

-- Create index for faster stock queries
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(track_stock, stock_quantity);

-- Update existing products to have default stock values
UPDATE products SET 
  stock_quantity = 100,
  low_stock_threshold = 5,
  track_stock = true 
WHERE stock_quantity IS NULL OR low_stock_threshold IS NULL OR track_stock IS NULL;
