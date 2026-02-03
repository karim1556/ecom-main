"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Play, CheckCircle, Circle, BookOpen, Clock, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/hooks/use-toast"

interface Module {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  video_url: string
  content: string
  order_index: number
  completed: boolean
}

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  level: string
  tags: string[]
  modules: Module[]
}

export default function CoursePlayerPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState<string>("")

  useEffect(() => {
    fetchCourse()
  }, [params.courseId])

  useEffect(() => {
    if (selectedLesson && selectedLesson.video_url) {
      console.log('Selected lesson video_url:', selectedLesson.video_url)
      // Check if it's an external URL (http/https)
      if (selectedLesson.video_url.startsWith('http://') || selectedLesson.video_url.startsWith('https://')) {
        // Use external URL directly
        console.log('Using external URL:', selectedLesson.video_url)
        setVideoUrl(selectedLesson.video_url)
      } else {
        // For internal storage paths, generate signed URL
        console.log('Generating signed URL for:', selectedLesson.video_url)
        generateSignedUrl(selectedLesson.video_url)
      }
    } else {
      console.log('No video URL available for lesson:', selectedLesson?.id)
      setVideoUrl('')
    }
  }, [selectedLesson])

  const generateSignedUrl = async (videoPath: string) => {
    try {
      console.log('Attempting to generate signed URL for:', videoPath)
      const response = await fetch('/api/courses/video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoPath }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Generated signed URL:', data.signedUrl)
        setVideoUrl(data.signedUrl)
      } else {
        console.error('Failed to generate signed URL, status:', response.status)
        setVideoUrl(videoPath) // Fallback to original URL
      }
    } catch (error) {
      console.error('Error generating signed URL:', error)
      setVideoUrl(videoPath) // Fallback to original URL
    }
  }

  const fetchCourse = async () => {
    try {
      const courseId = params.courseId as string
      
      // Check if user has access to this course
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth")
        return
      }

      const { data: userCourse, error: accessError } = await supabase
        .from("user_courses")
        .select("course_id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .single()

      if (accessError || !userCourse) {
        toast({
          title: "Access Denied",
          description: "You don't have access to this course",
          variant: "destructive"
        })
        router.push("/dashboard/courses")
        return
      }

      // Fetch course data with modules and lessons
      const { data: courseData, error: courseError } = await supabase
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
              video_url,
              content,
              order_index
            )
          )
        `)
        .eq("id", courseId)
        .single()

      if (courseError) throw courseError
      
      console.log('Fetched course data:', courseData)
      courseData.course_modules?.forEach((module: any) => {
        console.log(`Module: ${module.title}`)
        module.lessons?.forEach((lesson: any) => {
          console.log(`  Lesson: ${lesson.title}, video_url: ${lesson.video_url}`)
        })
      })

      // Fetch lesson progress
      const { data: lessonProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)

      const progressMap = new Map(
        lessonProgress?.map((lp: any) => [lp.lesson_id, lp.completed]) || []
      )

      // Transform data and add completion status
      const transformedCourse = {
        ...courseData,
        modules: (courseData.course_modules || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((module: any) => ({
            ...module,
            lessons: (module.lessons || [])
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((lesson: any) => ({
                ...lesson,
                completed: progressMap.get(lesson.id) || false
              }))
          }))
      }

      setCourse(transformedCourse)

      // Select first lesson by default
      const firstLesson = transformedCourse.modules[0]?.lessons[0]
      if (firstLesson) {
        setSelectedLesson(firstLesson)
      }
    } catch (error) {
      console.error("Failed to fetch course:", error)
      toast({
        title: "Error",
        description: "Failed to load course",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const markLessonComplete = async (lessonId: string, completed: boolean) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      if (completed) {
        // Mark as complete
        const { error } = await supabase
          .from("lesson_progress")
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            completed: true,
            completed_at: new Date().toISOString()
          })

        if (error) throw error
      } else {
        // Mark as incomplete
        const { error } = await supabase
          .from("lesson_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("lesson_id", lessonId)

        if (error) throw error
      }

      // Update local state
      if (course) {
        const updatedCourse = {
          ...course,
          modules: course.modules.map(module => ({
            ...module,
            lessons: module.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, completed } : lesson
            )
          }))
        }
        setCourse(updatedCourse)
      }

      if (selectedLesson?.id === lessonId) {
        setSelectedLesson(prev => prev ? { ...prev, completed } : null)
      }
    } catch (error) {
      console.error("Failed to update lesson progress:", error)
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      })
    }
  }

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
      <div className="flex h-screen">
        <div className="w-80 border-r border-border bg-muted/30">
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-1 pl-4">
                    {[...Array(2)].map((_, j) => (
                      <Skeleton key={j} className="h-4 w-40" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="p-8 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Course not found</h2>
          <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/dashboard/courses">
            <Button>Back to My Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Course Content */}
      <div className="w-96 border-r border-border bg-gradient-to-b from-muted/50 to-background flex flex-col">
        <div className="p-6 space-y-6 flex-shrink-0">
          {/* Course Info */}
          <div>
            <Link href="/dashboard/courses" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 font-medium transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
            <h1 className="text-2xl font-bold mb-3 leading-tight">{course.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{course.description}</p>
            <div className="flex items-center gap-3 text-sm">
              <Badge className={getLevelColor(course.level) + " font-semibold"}>
                {course.level}
              </Badge>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{course.modules.length} modules</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Modules and Lessons */}
          <ScrollArea className="flex-1">
            <div className="space-y-3 pr-4">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="space-y-1.5">
                  <h3 className="font-bold text-sm uppercase tracking-wide text-primary/80 px-3 py-2">
                    Module {moduleIndex + 1}: {module.title}
                  </h3>
                  <div className="space-y-1">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <button
                        key={lesson.id}
                        onClick={() => setSelectedLesson(lesson)}
                        className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                          selectedLesson?.id === lesson.id 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "hover:bg-muted/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {lesson.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium truncate flex-1">
                            {lessonIndex + 1}. {lesson.title}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedLesson ? (
          <div className="h-full flex flex-col">
            {/* Video Player */}
            <div className="flex-1 bg-black relative">
              {videoUrl ? (
                // Check if it's an embed URL (contains 'embed' or 'player') - use iframe
                videoUrl.includes('/embed/') || videoUrl.includes('/player/') ? (
                  <iframe
                    src={videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  // Direct video file - use video tag
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    poster={course.thumbnail_url || undefined}
                    autoPlay={false}
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md">
                      <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">No video available for this lesson</p>
                      <p className="text-sm text-gray-300">
                        The lesson "{selectedLesson?.title}" doesn't have a video URL set.
                        <br />
                        Please add a video URL in the curriculum editor.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Content */}
            <div className="border-t border-border bg-background">
              <div className="p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold">{selectedLesson.title}</h2>
                    <Button
                      variant={selectedLesson.completed ? "outline" : "default"}
                      onClick={() => markLessonComplete(selectedLesson.id, !selectedLesson.completed)}
                      className="gap-2 h-11 px-6"
                    >
                      {selectedLesson.completed ? (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Mark as Incomplete
                        </>
                      ) : (
                        <>
                          <Circle className="h-5 w-5" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  </div>

                  {selectedLesson.content && (
                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary">
                      <div dangerouslySetInnerHTML={{ 
                        __html: selectedLesson.content.replace(/\n/g, '<br>') 
                      }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-muted/30 to-background">
            <div className="text-center max-w-md px-4">
              <div className="bg-primary/5 rounded-full p-6 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Select a Lesson</h3>
              <p className="text-muted-foreground leading-relaxed">Choose a lesson from the sidebar to get started with your learning journey</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
