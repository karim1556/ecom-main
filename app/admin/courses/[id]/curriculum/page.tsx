"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Save, Edit, GripVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Module {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  video_url: string | null
  content: string | null
  order_index: number
  duration_minutes: number
}

export default function CourseCurriculumPage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<Module[]>([])
  
  // Dialog states
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false)
  const [isEditModuleOpen, setIsEditModuleOpen] = useState(false)
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false)
  const [isEditLessonOpen, setIsEditLessonOpen] = useState(false)
  
  // Form states
  const [newModuleTitle, setNewModuleTitle] = useState("")
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [newLesson, setNewLesson] = useState<Partial<Lesson> & { moduleId: string }>({ 
    moduleId: "", 
    title: "", 
    video_url: "", 
    content: "", 
    duration_minutes: 0 
  })
  const [editingLesson, setEditingLesson] = useState<Lesson & { moduleId: string } | null>(null)

  useEffect(() => {
    void fetchCourseData()
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()

      if (courseError) throw courseError
      setCourse(courseData)

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", courseId)
        .order("order_index", { ascending: true })

      if (modulesError) throw modulesError

      // Fetch lessons for each module
      const modulesWithLessons = await Promise.all(
        (modulesData || []).map(async (module: any) => {
          const { data: lessonsData, error: lessonsError } = await supabase
            .from("lessons")
            .select("*")
            .eq("module_id", module.id)
            .order("order_index", { ascending: true })

          if (lessonsError) throw lessonsError

          return {
            ...module,
            lessons: lessonsData || []
          }
        })
      )

      setModules(modulesWithLessons)
    } catch (error) {
      console.error("Failed to fetch course data:", error)
      toast({
        title: "Error",
        description: "Failed to load course data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return

    try {
      const { data, error } = await supabase
        .from("course_modules")
        .insert({
          course_id: courseId,
          title: newModuleTitle,
          order_index: modules.length
        })
        .select()
        .single()

      if (error) throw error

      setModules([...modules, { ...data, lessons: [] }])
      setNewModuleTitle("")
      setIsAddModuleOpen(false)
      
      toast({
        title: "Module added",
        description: "Module added successfully",
      })
    } catch (error) {
      console.error("Failed to add module:", error)
      toast({
        title: "Error",
        description: "Failed to add module",
        variant: "destructive",
      })
    }
  }

  const handleUpdateModule = async () => {
    if (!editingModule || !editingModule.title.trim()) return

    try {
      const { error } = await supabase
        .from("course_modules")
        .update({ title: editingModule.title })
        .eq("id", editingModule.id)

      if (error) throw error

      setModules(modules.map(m => m.id === editingModule.id ? editingModule : m))
      setEditingModule(null)
      setIsEditModuleOpen(false)
      
      toast({
        title: "Module updated",
        description: "Module updated successfully",
      })
    } catch (error) {
      console.error("Failed to update module:", error)
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive",
      })
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module? All lessons will also be deleted.")) {
      return
    }

    try {
      const { error } = await supabase
        .from("course_modules")
        .delete()
        .eq("id", moduleId)

      if (error) throw error

      setModules(modules.filter(m => m.id !== moduleId))
      
      toast({
        title: "Module deleted",
        description: "Module deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete module:", error)
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      })
    }
  }

  const handleAddLesson = async () => {
    if (!newLesson.title?.trim() || !newLesson.moduleId) return

    try {
      const module = modules.find(m => m.id === newLesson.moduleId)
      if (!module) return

      const { data, error } = await supabase
        .from("lessons")
        .insert({
          module_id: newLesson.moduleId,
          title: newLesson.title,
          video_url: newLesson.video_url || null,
          content: newLesson.content || null,
          order_index: module.lessons.length,
          duration_minutes: newLesson.duration_minutes || 0
        })
        .select()
        .single()

      if (error) throw error

      setModules(modules.map(m => 
        m.id === newLesson.moduleId 
          ? { ...m, lessons: [...m.lessons, data] }
          : m
      ))
      
      setNewLesson({ moduleId: "", title: "", video_url: "", content: "", duration_minutes: 0 })
      setIsAddLessonOpen(false)
      
      toast({
        title: "Lesson added",
        description: "Lesson added successfully",
      })
    } catch (error) {
      console.error("Failed to add lesson:", error)
      toast({
        title: "Error",
        description: "Failed to add lesson",
        variant: "destructive",
      })
    }
  }

  const handleUpdateLesson = async () => {
    if (!editingLesson || !editingLesson.title.trim()) return

    try {
      const { error } = await supabase
        .from("lessons")
        .update({
          title: editingLesson.title,
          video_url: editingLesson.video_url || null,
          content: editingLesson.content || null,
          duration_minutes: editingLesson.duration_minutes || 0
        })
        .eq("id", editingLesson.id)

      if (error) throw error

      setModules(modules.map(m => 
        m.id === editingLesson.moduleId
          ? {
              ...m,
              lessons: m.lessons.map(l => 
                l.id === editingLesson.id ? editingLesson : l
              )
            }
          : m
      ))
      
      setEditingLesson(null)
      setIsEditLessonOpen(false)
      
      toast({
        title: "Lesson updated",
        description: "Lesson updated successfully",
      })
    } catch (error) {
      console.error("Failed to update lesson:", error)
      toast({
        title: "Error",
        description: "Failed to update lesson",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) {
      return
    }

    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId)

      if (error) throw error

      setModules(modules.map(m => 
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) }
          : m
      ))
      
      toast({
        title: "Lesson deleted",
        description: "Lesson deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete lesson:", error)
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{course?.title}</h1>
            <p className="text-muted-foreground">Manage curriculum and lessons</p>
          </div>
        </div>

        <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="moduleTitle">Module Title</Label>
                <Input
                  id="moduleTitle"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Enter module title"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddModuleOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddModule}>Add Module</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No modules yet. Add your first module to get started.</p>
            <Button onClick={() => setIsAddModuleOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    Module {moduleIndex + 1}: {module.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingModule(module)
                        setIsEditModuleOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {module.lessons.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground mb-4">No lessons in this module yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewLesson({ ...newLesson, moduleId: module.id })
                        setIsAddLessonOpen(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              Lesson {lessonIndex + 1}: {lesson.title}
                            </div>
                            {lesson.duration_minutes > 0 && (
                              <div className="text-sm text-muted-foreground">
                                {lesson.duration_minutes} minutes
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingLesson({ ...lesson, moduleId: module.id })
                              setIsEditLessonOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLesson(module.id, lesson.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewLesson({ ...newLesson, moduleId: module.id })
                        setIsAddLessonOpen(true)
                      }}
                      className="w-full mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Lesson
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Module Dialog */}
      <Dialog open={isEditModuleOpen} onOpenChange={setIsEditModuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
          </DialogHeader>
          {editingModule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editModuleTitle">Module Title</Label>
                <Input
                  id="editModuleTitle"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  placeholder="Enter module title"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditModuleOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateModule}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lessonTitle">Lesson Title</Label>
              <Input
                id="lessonTitle"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                placeholder="Enter lesson title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={newLesson.video_url || ""}
                onChange={(e) => setNewLesson({ ...newLesson, video_url: e.target.value })}
                placeholder="https://example.com/video.mp4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={newLesson.duration_minutes}
                onChange={(e) => setNewLesson({ ...newLesson, duration_minutes: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Lesson Content</Label>
              <Textarea
                id="content"
                value={newLesson.content || ""}
                onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                placeholder="Lesson content (markdown supported)"
                rows={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddLessonOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLesson}>Add Lesson</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Lesson Dialog */}
      <Dialog open={isEditLessonOpen} onOpenChange={setIsEditLessonOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Lesson</DialogTitle>
          </DialogHeader>
          {editingLesson && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editLessonTitle">Lesson Title</Label>
                <Input
                  id="editLessonTitle"
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                  placeholder="Enter lesson title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editVideoUrl">Video URL</Label>
                <Input
                  id="editVideoUrl"
                  value={editingLesson.video_url || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDuration">Duration (minutes)</Label>
                <Input
                  id="editDuration"
                  type="number"
                  value={editingLesson.duration_minutes}
                  onChange={(e) => setEditingLesson({ ...editingLesson, duration_minutes: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContent">Lesson Content</Label>
                <Textarea
                  id="editContent"
                  value={editingLesson.content || ""}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                  placeholder="Lesson content (markdown supported)"
                  rows={6}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditLessonOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateLesson}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
