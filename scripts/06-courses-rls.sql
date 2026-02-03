-- RLS Policies for Course Management System

-- Courses table policies
DROP POLICY IF EXISTS "Admins can full access courses" ON courses;
CREATE POLICY "Admins can full access courses" ON courses
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

DROP POLICY IF EXISTS "Users can view courses they have access to" ON courses;
CREATE POLICY "Users can view courses they have access to" ON courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_courses 
            WHERE user_courses.course_id = courses.id 
            AND user_courses.user_id = auth.uid()
        )
    );

-- Course modules policies
DROP POLICY IF EXISTS "Admins can full access course modules" ON course_modules;
CREATE POLICY "Admins can full access course modules" ON course_modules
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

DROP POLICY IF EXISTS "Users can view modules for courses they have access to" ON course_modules;
CREATE POLICY "Users can view modules for courses they have access to" ON course_modules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_courses 
            WHERE user_courses.course_id = course_modules.course_id 
            AND user_courses.user_id = auth.uid()
        )
    );

-- Lessons policies
DROP POLICY IF EXISTS "Admins can full access lessons" ON lessons;
CREATE POLICY "Admins can full access lessons" ON lessons
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

DROP POLICY IF EXISTS "Users can view lessons for courses they have access to" ON lessons;
CREATE POLICY "Users can view lessons for courses they have access to" ON lessons
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM course_modules cm
            JOIN user_courses uc ON cm.course_id = uc.course_id
            WHERE cm.id = lessons.module_id 
            AND uc.user_id = auth.uid()
        )
    );

-- Product courses policies (for course association)
DROP POLICY IF EXISTS "Admins can full access product courses" ON product_courses;
CREATE POLICY "Admins can full access product courses" ON product_courses
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

DROP POLICY IF EXISTS "Anyone can view product courses" ON product_courses;
CREATE POLICY "Anyone can view product courses" ON product_courses
    FOR SELECT USING (true);

-- User courses policies
DROP POLICY IF EXISTS "Admins can full access user courses" ON user_courses;
CREATE POLICY "Admins can full access user courses" ON user_courses
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

DROP POLICY IF EXISTS "Users can view their own course access" ON user_courses;
CREATE POLICY "Users can view their own course access" ON user_courses
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert user course access" ON user_courses;
CREATE POLICY "System can insert user course access" ON user_courses
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete their own course access" ON user_courses;
CREATE POLICY "Users can delete their own course access" ON user_courses
    FOR DELETE USING (user_id = auth.uid());

-- Lesson progress policies
DROP POLICY IF EXISTS "Users can full access their own lesson progress" ON lesson_progress;
CREATE POLICY "Users can full access their own lesson progress" ON lesson_progress
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all lesson progress" ON lesson_progress;
CREATE POLICY "Admins can view all lesson progress" ON lesson_progress
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Function to check if user has access to a course
CREATE OR REPLACE FUNCTION user_has_course_access(user_uuid UUID, course_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_courses 
        WHERE user_courses.user_id = user_uuid 
        AND user_courses.course_id = course_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant course access to user
CREATE OR REPLACE FUNCTION grant_course_access(user_uuid UUID, course_uuid UUID, order_uuid UUID DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_courses (user_id, course_id, order_id)
    VALUES (user_uuid, course_uuid, order_uuid)
    ON CONFLICT (user_id, course_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get signed URL for course video
CREATE OR REPLACE FUNCTION get_course_video_url(video_path TEXT)
RETURNS TEXT AS $$
DECLARE
    signed_url TEXT;
BEGIN
    -- Get signed URL from Supabase Storage
    SELECT public.get_signed_url(video_path, 3600) INTO signed_url;
    
    IF signed_url IS NULL THEN
        RAISE EXCEPTION 'Video not found or access denied';
    END IF;
    
    RETURN signed_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION user_has_course_access TO authenticated;
GRANT EXECUTE ON FUNCTION grant_course_access TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_course_video_url TO authenticated;
