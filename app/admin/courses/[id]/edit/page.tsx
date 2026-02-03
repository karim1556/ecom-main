"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
}

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    tags: [] as string[],
    thumbnail_url: ""
  })
  const [modules, setModules] = useState<Module[]>([])
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    fetchCourse()
  }, [params.id])

  const fetchCourse = async () => {
    try {
      const courseId = params.id as string
      
      // Fetch course details
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      if (courseError) throw courseError

      setFormData({
        title: course.title,
        description: course.description || "",
        level: course.level,
        tags: course.tags || [],
        thumbnail_url: course.thumbnail_url || ""
      })

      // Fetch modules with lessons
      const { data: modulesData, error: modulesError } = await supabase
        .from("course_modules")
        .select(`
          *,
          lessons (
            id,
            title,
            video_url,
            content,
            order_index
          )
        `)
        .eq("course_id", courseId)
        .order("order_index")

      if (modulesError) throw modulesError

      const transformedModules = modulesData.map(module => ({
        ...module,
        lessons: (module.lessons || []).sort((a, b) => a.order_index - b.order_index)
      }))

      setModules(transformedModules)
    } catch (error) {
      console.error("Failed to fetch course:", error)
      toast({
        title: "Error",
        description: "Failed to load course data",
        variant: "destructive"
      })
    } finally {
      setFetchLoading(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addModule = () => {
    const newModule: Module = {
      id: crypto.randomUUID(),
      title: "",
      order_index: modules.length,
      lessons: []
    }
    setModules([...modules, newModule])
  }

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, ...updates } : module
    ))
  }

  const deleteModule = async (moduleId: string) => {
    // If module exists in database, delete it
    const existingModule = modules.find(m => m.id === moduleId)
    if (existingModule && !existingModule.id.startsWith('temp-')) {
      try {
        const { error } = await supabase
          .from("course_modules")
          .delete()
          .eq("id", moduleId)

        if (error) throw error
      } catch (error) {
        console.error("Failed to delete module:", error)
        return
      }
    }

    setModules(modules.filter(module => module.id !== moduleId))
  }

  const addLesson = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const newLesson: Lesson = {
      id: crypto.randomUUID(),
      title: "",
      video_url: "",
      content: "",
      order_index: module.lessons.length
    }

    updateModule(moduleId, {
      lessons: [...module.lessons, newLesson]
    })
  }

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? {
            ...module,
            lessons: module.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, ...updates } : lesson
            )
          }
        : module
    ))
  }

  const deleteLesson = async (moduleId: string, lessonId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const lesson = module.lessons.find(l => l.id === lessonId)
    if (lesson && !lesson.id.startsWith('temp-')) {
      try {
        const { error } = await supabase
          .from("lessons")
          .delete()
          .eq("id", lessonId)

        if (error) throw error
      } catch (error) {
        console.error("Failed to delete lesson:", error)
        return
      }
    }

    updateModule(moduleId, {
      lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const courseId = params.id as string

      // Update course
      const { error: courseError } = await supabase
        .from("courses")
        .update({
          title: formData.title,
          description: formData.description,
          level: formData.level,
          tags: formData.tags,
          thumbnail_url: formData.thumbnail_url || null
        })
        .eq("id", courseId)

      if (courseError) throw courseError

      // Update modules and lessons
      for (const module of modules) {
        if (module.id.startsWith('temp-')) {
          // Create new module
          const { data: moduleData, error: moduleError } = await supabase
            .from("course_modules")
            .insert({
              course_id: courseId,
              title: module.title,
              order_index: module.order_index
            })
            .select()
            .single()

          if (moduleError) throw moduleError

          // Create lessons for this module
          for (const lesson of module.lessons) {
            const { error: lessonError } = await supabase
              .from("lessons")
              .insert({
                module_id: moduleData.id,
                title: lesson.title,
                video_url: lesson.video_url,
                content: lesson.content,
                order_index: lesson.order_index
              })

            if (lessonError) throw lessonError
          }
        } else {
          // Update existing module
          const { error: moduleError } = await supabase
            .from("course_modules")
            .update({
              title: module.title,
              order_index: module.order_index
            })
            .eq("id", module.id)

          if (moduleError) throw moduleError

          // Update lessons for this module
          for (const lesson of module.lessons) {
            if (lesson.id.startsWith('temp-')) {
              // Create new lesson
              const { error: lessonError } = await supabase
                .from("lessons")
                .insert({
                  module_id: module.id,
                  title: lesson.title,
                  video_url: lesson.video_url,
                  content: lesson.content,
                  order_index: lesson.order_index
                })

              if (lessonError) throw lessonError
            } else {
              // Update existing lesson
              const { error: lessonError } = await supabase
                .from("lessons")
                .update({
                  title: lesson.title,
                  video_url: lesson.video_url,
                  content: lesson.content,
                  order_index: lesson.order_index
                })
                .eq("id", lesson.id)

              if (lessonError) throw lessonError
            }
          }
        }
      }

      toast({
        title: "Success",
        description: "Course updated successfully!"
      })

      router.push("/admin/courses")
    } catch (error) {
      console.error("Failed to update course:", error)
      toast({
        title: "Error",
        description: "Failed to update course. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground">Update your course content</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Details */}
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={formData.level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what students will learn"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
              <Input
                id="thumbnail_url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Course Modules</CardTitle>
            <Button type="button" onClick={addModule} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {modules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No modules yet. Add your first module to get started.
              </div>
            ) : (
              modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Module {moduleIndex + 1}</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => deleteModule(module.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Input
                    value={module.title}
                    onChange={(e) => updateModule(module.id, { title: e.target.value })}
                    placeholder="Module title"
                    required
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Lessons</h4>
                      <Button
                        type="button"
                        onClick={() => addLesson(module.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Lesson
                      </Button>
                    </div>

                    {module.lessons.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        No lessons yet. Add lessons to this module.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="border border-border rounded p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Lesson {lessonIndex + 1}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => deleteLesson(module.id, lesson.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                value={lesson.title}
                                onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                placeholder="Lesson title"
                                required
                              />
                              <Input
                                value={lesson.video_url}
                                onChange={(e) => updateLesson(module.id, lesson.id, { video_url: e.target.value })}
                                placeholder="Video URL"
                              />
                            </div>
                            
                            <Textarea
                              value={lesson.content}
                              onChange={(e) => updateLesson(module.id, lesson.id, { content: e.target.value })}
                              placeholder="Lesson content (markdown supported)"
                              rows={2}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Updating..." : "Update Course"}
          </Button>
          <Link href="/admin/courses">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
