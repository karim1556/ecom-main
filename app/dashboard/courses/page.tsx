"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookOpen, Play, Clock, BarChart3, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  level: "beginner" | "intermediate" | "advanced"
  tags: string[]
  granted_at: string
  modules: { count: number }
  completed_lessons: { count: number }
  total_lessons: { count: number }
  progress_percentage: number
}

export default function UserCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all")
  const supabase = createClient()

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: userCourses, error: userCoursesError } = await supabase
        .from("user_courses")
        .select(`
          granted_at,
          course:courses (
            id,
            title,
            description,
            thumbnail_url,
            level,
            tags,
            course_modules (
              id,
              lessons (
                id
              )
            )
          )
        `)
        .eq("user_id", user.id)

      if (userCoursesError) throw userCoursesError

      // Calculate progress for each course
      const coursesWithProgress = await Promise.all(
        userCourses.map(async (userCourse: any) => {
          const course = userCourse.course as any
          
          // Get all lesson IDs for this course
          const lessonIds = course.course_modules?.flatMap((module: any) => 
            module.lessons?.map((lesson: any) => lesson.id) || []
          ) || []
          
          const totalLessons = lessonIds.length

          // Get completed lessons count for THIS course only
          let completedCount = 0
          if (lessonIds.length > 0) {
            const { data: completedLessons } = await supabase
              .from("lesson_progress")
              .select("lesson_id")
              .eq("user_id", user.id)
              .eq("completed", true)
              .in("lesson_id", lessonIds)

            completedCount = completedLessons?.length || 0
          }
          
          const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

          return {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            level: course.level,
            tags: course.tags || [],
            granted_at: userCourse.granted_at,
            modules: { count: course.course_modules?.length || 0 },
            completed_lessons: { count: completedCount },
            total_lessons: { count: totalLessons },
            progress_percentage: progressPercentage
          }
        })
      )

      setCourses(coursesWithProgress)
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === "all" || course.level === levelFilter
    return matchesSearch && matchesLevel
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800"
      case "intermediate": return "bg-yellow-100 text-yellow-800"
      case "advanced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full rounded-lg mb-4" />
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-2 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-2">Continue your learning journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-4 py-2">
            <BookOpen className="h-4 w-4 mr-2" />
            {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as any)}
          className="px-4 py-2.5 border border-border rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer min-w-[150px]"
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || levelFilter !== "all" 
                ? "Try adjusting your filters" 
                : "You haven't enrolled in any courses yet. Check out our shop to get started!"}
            </p>
            <Link href="/shop">
              <Button>
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
              {/* Course Thumbnail */}
              <div className="relative h-52 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-muted-foreground/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 right-4">
                  <Badge className={getLevelColor(course.level) + " shadow-lg"}>
                    {course.level}
                  </Badge>
                </div>
                {course.progress_percentage > 0 && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-black/70 text-white hover:bg-black/70">
                      {Math.round(course.progress_percentage)}% Complete
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                {/* Course Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span>{course.modules.count} modules</span>
                    </div>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{new Date(course.granted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  {course.total_lessons.count > 0 && (
                    <div className="space-y-2.5 bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          Progress
                        </span>
                        <span className="text-primary font-bold">{Math.round(course.progress_percentage)}%</span>
                      </div>
                      <Progress value={course.progress_percentage} className="h-2.5" />
                      <p className="text-xs text-muted-foreground font-medium">
                        {course.completed_lessons.count} of {course.total_lessons.count} lessons completed
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {course.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {course.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{course.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full h-11 font-semibold group/btn">
                      <Play className="h-4 w-4 mr-2 transition-transform group-hover/btn:scale-110" />
                      {course.progress_percentage > 0 ? "Continue Learning" : "Start Course"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
