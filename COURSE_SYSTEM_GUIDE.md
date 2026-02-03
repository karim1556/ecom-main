# 🎓 Course System - Complete Setup Guide

## ✅ What's Already Working

### 1. **Course Playback for Users**
- **Page**: [app/courses/[courseId]/page.tsx](app/courses/[courseId]/page.tsx)
- **Route**: `/courses/{courseId}`
- Users can watch video lessons, track progress, mark lessons complete
- Video player with module/lesson navigation

### 2. **User Course Dashboard**
- **Page**: [app/dashboard/courses/page.tsx](app/dashboard/courses/page.tsx)
- **Route**: `/dashboard/courses`
- Shows all courses user has access to
- Progress tracking and quick resume

### 3. **Product-Course Linking (Admin)**
- **Page**: [app/admin/products/[id]/page.tsx](app/admin/products/[id]/page.tsx)
- When editing a product, you can select which courses come with it
- Uses `product_courses` table to link products to courses

### 4. **Auto-Grant Course Access on Purchase** ✨
- **File**: [app/api/checkout/route.ts](app/api/checkout/route.ts) (lines 122-141)
- When user purchases product, system automatically:
  1. Checks if product has linked courses
  2. Grants user access to those courses
  3. Creates entry in `user_courses` table

---

## 🔄 Complete Flow

```
1. Admin creates course
   └─> /admin/courses/new (multi-step wizard)

2. Admin links course to product
   └─> /admin/products/{id}/edit
   └─> Select courses in "Associated Courses" section

3. User purchases product
   └─> Checkout process runs
   └─> System checks product_courses table
   └─> Grants access via user_courses table

4. User accesses course
   └─> Goes to /dashboard/courses
   └─> Sees newly granted courses
   └─> Clicks "Continue" to watch at /courses/{courseId}
```

---

## 📊 Database Tables Used

### `courses`
- Stores course information (title, description, thumbnail, level)

### `course_modules`
- Modules/sections within a course

### `lessons`
- Individual lessons with video URLs and content

### `product_courses` ⭐
- Links products to courses
- **Key**: `product_id` + `course_id`

### `user_courses` ⭐
- Grants course access to users
- **Key**: `user_id` + `course_id`
- Auto-populated on purchase

### `lesson_progress`
- Tracks which lessons user completed

---

## 🎯 How to Use

### For Admins:

1. **Create a Course**
   - Go to `/admin/courses`
   - Click "Create Course"
   - Fill 8-step form
   - Add modules & lessons via "Curriculum" button

2. **Link Course to Product**
   - Go to `/admin/products`
   - Edit a product
   - Scroll to "Associated Courses"
   - Select the courses that come with this product
   - Save

### For Users:

1. **Purchase Product**
   - Browse products, add to cart
   - Complete checkout

2. **Access Courses**
   - Go to `/dashboard/courses`
   - See granted courses
   - Click to watch

---

## 🔍 Testing the Flow

1. **Setup** (if not done):
   - Run `scripts/05-courses-schema.sql` in Supabase
   - Run `scripts/06-courses-rls.sql` or `scripts/temp-fix-rls.sql`

2. **Create Test Data**:
   - Create a course in admin panel
   - Edit a product and link the course
   - Purchase that product as a test user

3. **Verify**:
   - Check `/dashboard/courses` - course should appear
   - Click course - should be able to watch

---

## 🐛 Current Status

✅ Course creation & management  
✅ Course player with video playback  
✅ Product-course linking in admin  
✅ Auto-grant access on purchase  
✅ User course dashboard  
✅ Progress tracking  

**Everything is already working!** Just make sure:
- Database tables are created (run migration scripts)
- RLS policies allow access (run temp-fix-rls.sql)
- You're logged in when testing
