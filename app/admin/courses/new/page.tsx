"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen, FileEdit, ListChecks, Target, DollarSign, Image as ImageIcon, Search, Check, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
  duration_minutes?: number
}

interface CourseRequirement {
  id: string
  text: string
}

interface CourseObjective {
  id: string
  text: string
}

type Step = "curriculum" | "basic" | "requirements" | "outcomes" | "pricing" | "media" | "seo" | "finish"

const steps: { id: Step; label: string; icon: any }[] = [
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
  { id: "basic", label: "Basic", icon: FileEdit },
  { id: "requirements", label: "Requirements", icon: ListChecks },
  { id: "outcomes", label: "Outcomes", icon: Target },
  { id: "pricing", label: "Pricing", icon: DollarSign },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "seo", label: "Seo", icon: Search },
  { id: "finish", label: "Finish", icon: Check },
]

export default function NewCoursePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState<Step>("curriculum")
  const [loading, setLoading] = useState(false)
  
  // Basic info
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    provider: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    language: "English",
    duration: "",
    totalLessons: "",
    maxStudents: "",
    rating: "",
    tags: [] as string[],
  })

  // Curriculum/Modules
  const [modules, setModules] = useState<Module[]>([])
  
  // Requirements
  const [requirements, setRequirements] = useState<CourseRequirement[]>([{ id: crypto.randomUUID(), text: "" }])
  
  // Objectives/Outcomes
  const [objectives, setObjectives] = useState<CourseObjective[]>([{ id: crypto.randomUUID(), text: "" }])
  
  // Pricing
  const [pricing, setPricing] = useState<"free" | "paid">("free")
  const [price, setPrice] = useState("")
  
  // Media
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [demoVideoUrl, setDemoVideoUrl] = useState("")
  const [demoVideoFile, setDemoVideoFile] = useState<File | null>(null)
  const [attachments, setAttachments] = useState<string[]>([])
  const [externalLinks, setExternalLinks] = useState<string[]>([])
  
  // SEO
  const [seoTitle, setSeoTitle] = useState("")
  const [seoDescription, setSeoDescription] = useState("")
  const [seoKeywords, setSeoKeywords] = useState("")

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
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

  const deleteModule = (moduleId: string) => {
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

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    updateModule(moduleId, {
      lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
    })
  }

  const addRequirement = () => {
    setRequirements([...requirements, { id: crypto.randomUUID(), text: "" }])
  }

  const updateRequirement = (id: string, text: string) => {
    setRequirements(requirements.map(req => req.id === id ? { ...req, text } : req))
  }

  const deleteRequirement = (id: string) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter(req => req.id !== id))
    }
  }

  const addObjective = () => {
    setObjectives([...objectives, { id: crypto.randomUUID(), text: "" }])
  }

  const updateObjective = (id: string, text: string) => {
    setObjectives(objectives.map(obj => obj.id === id ? { ...obj, text } : obj))
  }

  const deleteObjective = (id: string) => {
    if (objectives.length > 1) {
      setObjectives(objectives.filter(obj => obj.id !== id))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
    }
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null

    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `course-thumbnails/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('course-thumbnails')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('course-thumbnails')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Upload thumbnail if selected
      let thumbnailUrl = null
      if (imageFile) {
        thumbnailUrl = await uploadImage()
      }

      // Create course
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .insert({
          title: formData.title,
          description: formData.description,
          level: formData.level,
          tags: formData.tags,
          thumbnail_url: thumbnailUrl
        })
        .select()
        .single()

      if (courseError) throw courseError

      // Create modules and lessons
      for (const module of modules) {
        if (!module.title.trim()) continue

        const { data: moduleData, error: moduleError } = await supabase
          .from("course_modules")
          .insert({
            course_id: course.id,
            title: module.title,
            order_index: module.order_index
          })
          .select()
          .single()

        if (moduleError) throw moduleError

        // Create lessons for this module
        for (const lesson of module.lessons) {
          if (!lesson.title.trim()) continue

          const { error: lessonError } = await supabase
            .from("lessons")
            .insert({
              module_id: moduleData.id,
              title: lesson.title,
              video_url: lesson.video_url || null,
              content: lesson.content || null,
              order_index: lesson.order_index,
              duration_minutes: lesson.duration_minutes || 0
            })

          if (lessonError) throw lessonError
        }
      }

      toast({
        title: "Course created",
        description: "Course created successfully!",
      })
      router.push("/admin/courses")
    } catch (error) {
      console.error("Failed to create course:", error)
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case "curriculum":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Curriculum</h2>
              <p className="text-muted-foreground mb-6">
                Add modules and lessons to your course. You can also add or edit these later in the curriculum editor.
              </p>
            </div>

            {modules.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-2">No modules added yet</p>
                <Button onClick={() => addModule()}>Add First Module</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((module, moduleIndex) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`module-${module.id}`}>Module Title</Label>
                          <Input
                            id={`module-${module.id}`}
                            value={module.title}
                            onChange={(e) => updateModule(module.id, { title: e.target.value })}
                            placeholder="Module title"
                            className="mt-1"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteModule(module.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div key={lesson.id} className="space-y-2 p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between gap-2">
                              <Input
                                value={lesson.title}
                                onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                                placeholder="Lesson title"
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteLesson(module.id, lesson.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              value={lesson.video_url || ""}
                              onChange={(e) => updateLesson(module.id, lesson.id, { video_url: e.target.value })}
                              placeholder="Video URL (https://example.com/video.mp4)"
                              className="text-sm"
                            />
                            <Textarea
                              value={lesson.content || ""}
                              onChange={(e) => updateLesson(module.id, lesson.id, { content: e.target.value })}
                              placeholder="Lesson content"
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addLesson(module.id)}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Lesson
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Button onClick={() => addModule()} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>
        )

      case "basic":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                  placeholder="Course provider"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what students will learn"
                rows={4}
                required
              />
            </div>

            <div className="text-xl font-semibold mt-6">Course Details</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select value={formData.level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Select level</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  placeholder="English"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="e.g., 10 hours"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalLessons">Total Lessons</Label>
                <Input
                  id="totalLessons"
                  type="number"
                  value={formData.totalLessons}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalLessons: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStudents">Number of Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Number of Reviews</Label>
                <Input
                  id="rating"
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ratingValue">Rating (0-5)</Label>
                <Input
                  id="ratingValue"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )

      case "requirements":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Course Requirements</h2>
            
            <div className="space-y-4">
              <Label>Course Requirements</Label>
              <Textarea
                placeholder="What prerequisites are needed for this course?"
                rows={6}
                value={requirements[0]?.text || ""}
                onChange={(e) => updateRequirement(requirements[0].id, e.target.value)}
              />
            </div>
          </div>
        )

      case "outcomes":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">What You'll Learn (Objectives)</h2>
            
            <div className="space-y-4">
              {objectives.map((obj, index) => (
                <div key={obj.id} className="flex gap-2">
                  <Input
                    value={obj.text}
                    onChange={(e) => updateObjective(obj.id, e.target.value)}
                    placeholder={`Objective ${index + 1}`}
                  />
                  {objectives.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => deleteObjective(obj.id)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addObjective}
                className="w-full"
              >
                + Add Objective
              </Button>
            </div>
          </div>
        )

      case "pricing":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Course Pricing</h2>
            
            <RadioGroup value={pricing} onValueChange={(value: any) => setPricing(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="free" />
                <Label htmlFor="free">Free Course</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid">Paid Course</Label>
              </div>
            </RadioGroup>

            {pricing === "paid" && (
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        )

      case "media":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Course Media</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Course thumbnail</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-48 h-48 object-cover rounded" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoVideoUrl">Demo Video URL</Label>
                <Input
                  id="demoVideoUrl"
                  value={demoVideoUrl}
                  onChange={(e) => setDemoVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoVideoFile">Or Upload Demo Video</Label>
                <Input
                  id="demoVideoFile"
                  type="file"
                  accept="video/*"
                  onChange={(e) => setDemoVideoFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-2">
                <Label>Attachments</Label>
                <Button type="button" variant="outline" size="sm">
                  + Add Attachment
                </Button>
              </div>

              <div className="space-y-2">
                <Label>External Links</Label>
                <Button type="button" variant="outline" size="sm">
                  + Add Link
                </Button>
              </div>
            </div>
          </div>
        )

      case "seo":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">SEO Settings</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Course SEO title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="SEO description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">SEO Keywords</Label>
                <Input
                  id="seoKeywords"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>
        )

      case "finish":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review & Finish</h2>
            <p className="text-muted-foreground">
              Review your course details and click "Create Course" to finish.
            </p>
            
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <div className="font-semibold">Course Title</div>
                  <div className="text-muted-foreground">{formData.title || "Not set"}</div>
                </div>
                <div>
                  <div className="font-semibold">Description</div>
                  <div className="text-muted-foreground">{formData.description || "Not set"}</div>
                </div>
                <div>
                  <div className="font-semibold">Level</div>
                  <Badge>{formData.level}</Badge>
                </div>
                <div>
                  <div className="font-semibold">Pricing</div>
                  <div className="text-muted-foreground">{pricing === "free" ? "Free" : `Paid - $${price}`}</div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSubmit} disabled={loading} className="w-full" size="lg">
              {loading ? "Creating..." : "Create Course"}
            </Button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/admin/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to course list
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">Step {currentStepIndex + 1} of {steps.length}</h1>
            <span className="text-sm font-medium">{Math.round(progressPercent)}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isPast = steps.findIndex(s => s.id === step.id) < currentStepIndex
              
              return (
                <Button
                  key={step.id}
                  variant={isActive ? "default" : isPast ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentStep(step.id)}
                  className="whitespace-nowrap"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {step.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            Previous
          </Button>
          
          {currentStep !== "finish" ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
