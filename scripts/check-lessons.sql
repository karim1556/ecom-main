-- Check lesson data for the course
SELECT 
  c.title as course_title,
  m.title as module_title,
  l.id as lesson_id,
  l.title as lesson_title,
  l.video_url,
  l.content
FROM courses c
JOIN course_modules m ON m.course_id = c.id
JOIN lessons l ON l.module_id = m.id
WHERE c.title LIKE '%aiskool%' OR c.title LIKE '%idk%'
ORDER BY m.order_index, l.order_index;
