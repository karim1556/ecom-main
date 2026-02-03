-- Add address fields to profiles table
-- This migration adds complete address information for customer management

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.full_name IS 'User full name (first + last name)';
COMMENT ON COLUMN public.profiles.phone IS 'Phone number for contact';
COMMENT ON COLUMN public.profiles.address IS 'Street address line';
COMMENT ON COLUMN public.profiles.city IS 'City name';
COMMENT ON COLUMN public.profiles.state IS 'State or region';
COMMENT ON COLUMN public.profiles.postal_code IS 'ZIP or postal code';
COMMENT ON COLUMN public.profiles.country IS 'Country name';
COMMENT ON COLUMN public.profiles.updated_at IS 'Last profile update timestamp';

-- Create index on updated_at for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);
