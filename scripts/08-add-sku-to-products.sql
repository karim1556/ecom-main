-- Add SKU (Stock Keeping Unit) field to products table
ALTER TABLE products ADD COLUMN sku VARCHAR(100) UNIQUE;

-- Add comment to describe the SKU field
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - Unique product identifier for inventory management';

-- Create index for faster SKU lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
