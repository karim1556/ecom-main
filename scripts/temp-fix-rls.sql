-- Temporary: Allow authenticated users full access to courses and products for development
-- Run this in Supabase SQL Editor to fix RLS permission issues

-- Courses - Full access for authenticated users
DROP POLICY IF EXISTS "Authenticated users can manage courses" ON courses;
CREATE POLICY "Authenticated users can manage courses" ON courses
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Course modules - Full access for authenticated users
DROP POLICY IF EXISTS "Authenticated users can manage course modules" ON course_modules;
CREATE POLICY "Authenticated users can manage course modules" ON course_modules
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Lessons - Full access for authenticated users
DROP POLICY IF EXISTS "Authenticated users can manage lessons" ON lessons;
CREATE POLICY "Authenticated users can manage lessons" ON lessons
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Product courses - Full access for authenticated users
DROP POLICY IF EXISTS "Authenticated users can manage product courses" ON product_courses;
CREATE POLICY "Authenticated users can manage product courses" ON product_courses
    FOR ALL USING (auth.uid() IS NOT NULL);

-- User courses - Full access for authenticated users
DROP POLICY IF EXISTS "Authenticated users can manage user courses" ON user_courses;
CREATE POLICY "Authenticated users can manage user courses" ON user_courses
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Lesson progress - Full access for authenticated users
DROP POLICY IF EXISTS "Authenticated users can manage lesson progress" ON lesson_progress;
CREATE POLICY "Authenticated users can manage lesson progress" ON lesson_progress
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Products - Full access for authenticated users (for admin)
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Categories - Full access for authenticated users (for admin)
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
CREATE POLICY "Authenticated users can manage categories" ON categories
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Note: This gives all authenticated users full access (for development)
-- In production, you should use proper admin role checks
