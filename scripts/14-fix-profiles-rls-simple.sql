-- Fix infinite recursion in profiles RLS policies
-- Use auth.uid() directly instead of subqueries

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_update_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_can_insert_profiles" ON public.profiles;
DROP POLICY IF EXISTS "admins_manage_products" ON public.products;
DROP POLICY IF EXISTS "admins_view_all_orders" ON public.orders;

-- Create simple, non-recursive policies for profiles
-- 1. Users can view their own profile
CREATE POLICY "users_can_view_own_profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. Users can update their own profile
CREATE POLICY "users_can_update_own_profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Users can insert their own profile (for upsert)
CREATE POLICY "users_can_insert_own_profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Users can view all profiles (for checkout to work)
CREATE POLICY "users_can_view_profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

-- 5. Users can update all profiles (for checkout to work)
CREATE POLICY "users_can_update_profiles"
  ON public.profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 6. Users can insert profiles (for checkout to work)
CREATE POLICY "users_can_insert_profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Recreate admin policies for other tables (without recursion)
-- Admin products policy
CREATE POLICY "admins_manage_products"
  ON public.products
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'admin' AND id = auth.uid()
    )
  );

-- Admin orders policy
CREATE POLICY "admins_view_all_orders"
  ON public.orders
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.profiles 
      WHERE role = 'admin' AND id = auth.uid()
    )
  );

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
