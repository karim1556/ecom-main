"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Edit, BookOpen } from "lucide-react"

interface Lesson {
  id: string
  title: string
  order_index: number
}

interface Module {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  description: string | null
  level: string
  tags: string[]
  thumbnail_url: string | null
  modules: Module[]
}

export default function AdminCourseViewPage() {
  const params = useParams()
  const supabase = createClient()

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseId = params.id as string

        const { data, error } = await supabase
          .from("courses")
          .select(`
            *,
            course_modules (
              id,
              title,
              order_index,
              lessons (
                id,
                title,
                order_index
              )
            )
          `)
          .eq("id", courseId)
          .single()

        if (error) throw error

        const transformed: Course = {
          id: data.id,
          title: data.title,
          description: data.description,
          level: data.level,
          tags: data.tags || [],
          thumbnail_url: data.thumbnail_url,
          modules: (data.course_modules || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((m: any) => ({
              id: m.id,
              title: m.title,
              order_index: m.order_index,
              lessons: (m.lessons || [])
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((l: any) => ({
                  id: l.id,
                  title: l.title,
                  order_index: l.order_index,
                })),
            })),
        }

        setCourse(transformed)
      } catch (error) {
        console.error("Failed to load course:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [params.id, supabase])

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Course not found</h2>
            <p className="text-muted-foreground mb-4">The requested course could not be loaded.</p>
            <Link href="/admin/courses">
              <Button>Back to course list</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
        </div>
        <Link href={`/admin/courses/₹{course.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Course
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Course Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.thumbnail_url && (
              <div className="w-full max-h-64 overflow-hidden rounded-lg border bg-muted">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {course.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {course.description}
              </p>
            )}

            {course.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {course.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modules & Lessons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[480px] overflow-y-auto">
            {course.modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No modules added yet.
              </p>
            ) : (
              course.modules.map((module, index) => (
                <div key={module.id} className="space-y-2">
                  <div className="font-semibold text-sm">
                    Module {index + 1}: {module.title}
                  </div>
                  {module.lessons.length === 0 ? (
                    <p className="text-xs text-muted-foreground pl-4">No lessons in this module.</p>
                  ) : (
                    <ul className="space-y-1 pl-4 text-sm text-muted-foreground">
                      {module.lessons.map((lesson, li) => (
                        <li key={lesson.id}>
                          {li + 1}. {lesson.title}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
