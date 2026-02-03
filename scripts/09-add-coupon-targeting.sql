-- Add product and category targeting to coupons table
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_products UUID[];
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS applicable_categories TEXT[];

-- Add comments to describe the new fields
COMMENT ON COLUMN coupons.applicable_products IS 'Array of specific product IDs this coupon applies to (null = all products)';
COMMENT ON COLUMN coupons.applicable_categories IS 'Array of category names this coupon applies to (null = all categories)';

-- Create index for faster product targeting lookups
CREATE INDEX IF NOT EXISTS idx_coupons_products ON coupons USING GIN(applicable_products);

-- Create index for faster category targeting lookups
CREATE INDEX IF NOT EXISTS idx_coupons_categories ON coupons USING GIN(applicable_categories);

-- Update existing coupons to have null values (apply to all products/categories)
UPDATE coupons SET 
  applicable_products = NULL, 
  applicable_categories = NULL 
WHERE applicable_products IS NULL OR applicable_categories IS NULL;
