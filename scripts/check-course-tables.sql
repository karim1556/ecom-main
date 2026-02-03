-- Run this in Supabase SQL Editor to check if course tables exist

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('courses', 'course_modules', 'lessons', 'product_courses', 'user_courses', 'lesson_progress')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('courses', 'course_modules', 'lessons', 'product_courses', 'user_courses', 'lesson_progress')
ORDER BY table_name;

-- If no results appear, run the migration scripts:
-- 1. scripts/05-courses-schema.sql
-- 2. scripts/06-courses-rls.sql
