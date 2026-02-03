"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Edit, Trash2, BookOpen, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  level: "beginner" | "intermediate" | "advanced"
  tags: string[]
  created_at: string
  updated_at: string
  modules: { count: number }
  enrollments: { count: number }
}

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced"

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all")
  const supabase = createClient()

  useEffect(() => {
    void fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false })

      if (coursesError) {
        console.error("Supabase error:", coursesError)
        throw coursesError
      }

      const transformedCourses: Course[] = (coursesData || []).map((course: any) => ({
        ...course,
        modules: { count: 0 },
        enrollments: { count: 0 },
      }))

      setCourses(transformedCourses)
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      // Set empty array on error so loading state ends
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("courses").delete().eq("id", courseId)
      if (error) throw error

      setCourses((prev) => prev.filter((course) => course.id !== courseId))
    } catch (error) {
      console.error("Failed to delete course:", error)
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === "all" || course.level === levelFilter
    return matchesSearch && matchesLevel
  })

  if (loading) {
    return <CoursesLoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      <CoursesHeader />

      <CoursesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        levelFilter={levelFilter}
        onLevelFilterChange={setLevelFilter}
      />

      <CoursesList
        courses={filteredCourses}
        isFiltered={Boolean(searchTerm || levelFilter !== "all")}
        onDelete={handleDelete}
      />
    </div>
  )
}

function CoursesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage and organize your course catalog</p>
      </div>
      <Link href="/admin/courses/new">
        <Button className="h-11 px-6 font-semibold gap-2">
          <Plus className="h-5 w-5" />
          Create Course
        </Button>
      </Link>
    </div>
  )
}

interface CoursesFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  levelFilter: LevelFilter
  onLevelFilterChange: (value: LevelFilter) => void
}

function CoursesFilters({ searchTerm, onSearchChange, levelFilter, onLevelFilterChange }: CoursesFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses by title or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 h-11 border-border/50"
        />
      </div>
      <select
        value={levelFilter}
        onChange={(e) => onLevelFilterChange(e.target.value as LevelFilter)}
        className="px-4 py-2.5 border border-border/50 rounded-lg bg-background h-11 font-medium min-w-max hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <option value="all">All Levels</option>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
    </div>
  )
}

interface CoursesListProps {
  courses: Course[]
  isFiltered: boolean
  onDelete: (id: string) => void
}

function CoursesList({ courses, isFiltered, onDelete }: CoursesListProps) {
  if (courses.length === 0) {
    return <CoursesEmptyState isFiltered={isFiltered} />
  }

  return (
    <div className="grid gap-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} onDelete={onDelete} />
      ))}
    </div>
  )
}

function CoursesEmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="py-16 px-12 text-center">
        <div className="bg-muted/50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <BookOpen className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold mb-3">No courses found</h3>
        <p className="text-muted-foreground mb-6 text-lg">
          {isFiltered ? "Try adjusting your filters" : "Get started by creating your first course"}
        </p>
        <Link href="/admin/courses/new">
          <Button className="h-11 px-6 font-semibold gap-2">
            <Plus className="h-5 w-5" />
            Create Course
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function getLevelColor(level: string) {
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

function CourseCard({ course, onDelete }: { course: Course; onDelete: (id: string) => void }) {
  return (
    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-border/50">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="h-24 w-24 rounded-lg object-cover shadow-sm"
              />
            ) : (
              <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Course Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="font-bold text-lg line-clamp-2">{course.title}</h3>
              <Badge className={getLevelColor(course.level) + " font-semibold"}>{course.level}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{course.modules.count} modules</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="font-medium">{course.enrollments.count} students</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <Link href={`/admin/courses/${course.id}/curriculum`}>
              <Button variant="default" size="sm" className="h-10 px-4 font-semibold gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Curriculum</span>
              </Button>
            </Link>
            <Link href={`/admin/courses/${course.id}/edit`}>
              <Button variant="outline" size="sm" className="h-10 w-10 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(course.id)}
              className="h-10 w-10 p-0 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CoursesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
