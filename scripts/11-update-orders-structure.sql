-- Update orders table to support detailed order information
-- This migration changes from individual product orders to consolidated orders

-- Add new columns for detailed order information
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS items JSONB,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS shipping DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id),
ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- Update existing orders to have default values
-- Only update if the old amount column exists
UPDATE orders 
SET 
  items = '[]',
  subtotal = COALESCE(amount, 0),
  shipping = 0,
  tax = COALESCE(amount, 0) * 0.1,
  discount = 0,
  total = COALESCE(amount, 0) + COALESCE(amount, 0) * 0.1,
  coupon_code = NULL
WHERE items IS NULL AND amount IS NOT NULL;

-- For orders without amount column, set defaults
UPDATE orders 
SET 
  items = '[]',
  subtotal = 0,
  shipping = 0,
  tax = 0,
  discount = 0,
  total = 0,
  coupon_code = NULL
WHERE items IS NULL AND amount IS NULL;

-- Add comments
COMMENT ON COLUMN orders.items IS 'JSON array of cart items with product details';
COMMENT ON COLUMN orders.subtotal IS 'Subtotal of all items before discounts and taxes';
COMMENT ON COLUMN orders.shipping IS 'Shipping cost';
COMMENT ON COLUMN orders.tax IS 'Tax amount (typically 10%)';
COMMENT ON COLUMN orders.discount IS 'Total discount amount from coupons';
COMMENT ON COLUMN orders.total IS 'Final total amount paid';
COMMENT ON COLUMN orders.coupon_id IS 'Reference to applied coupon';
COMMENT ON COLUMN orders.coupon_code IS 'Coupon code that was applied';
