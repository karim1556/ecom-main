import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Calendar, Clock, User, ArrowRight, Search } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "Getting Started with Arduino: A Beginner's Guide",
    excerpt: "Learn the basics of Arduino programming and build your first project with step-by-step instructions.",
    image: "/placeholder.svg?height=300&width=500",
    category: "Tutorials",
    author: "Rahul Sharma",
    date: "Dec 5, 2025",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: 2,
    title: "Top 10 Robotics Projects for College Students",
    excerpt: "Discover the most impressive robotics projects that will boost your engineering portfolio.",
    image: "/placeholder.svg?height=300&width=500",
    category: "Projects",
    author: "Priya Patel",
    date: "Dec 3, 2025",
    readTime: "6 min read",
    featured: true,
  },
  {
    id: 3,
    title: "Understanding IoT: From Sensors to Cloud",
    excerpt: "A comprehensive guide to building IoT solutions from hardware to cloud integration.",
    image: "/placeholder.svg?height=300&width=500",
    category: "IoT",
    author: "Amit Kumar",
    date: "Dec 1, 2025",
    readTime: "10 min read",
    featured: false,
  },
  {
    id: 4,
    title: "How to Win Science Fair Competitions",
    excerpt: "Tips and strategies from past winners on creating award-winning science projects.",
    image: "/placeholder.svg?height=300&width=500",
    category: "Tips",
    author: "Sneha Reddy",
    date: "Nov 28, 2025",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: 5,
    title: "Building a Smart Home System with Raspberry Pi",
    excerpt: "Step-by-step tutorial on creating your own home automation system using Raspberry Pi.",
    image: "/placeholder.svg?height=300&width=500",
    category: "Tutorials",
    author: "Vikram Singh",
    date: "Nov 25, 2025",
    readTime: "12 min read",
    featured: false,
  },
  {
    id: 6,
    title: "The Future of STEM Education in India",
    excerpt: "Exploring how technology is transforming STEM education and creating new opportunities.",
    image: "/placeholder.svg?height=300&width=500",
    category: "Education",
    author: "Dr. Anita Desai",
    date: "Nov 22, 2025",
    readTime: "7 min read",
    featured: false,
  },
]

const categories = ["All", "Tutorials", "Projects", "IoT", "Tips", "Education"]

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 border-b border-border py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our <span className="text-primary">Blog</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Discover tutorials, project ideas, and insights to fuel your STEM journey
            </p>
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search articles..." className="pl-10 h-12" />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 px-4 border-b border-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === "All" ? "default" : "outline"}
                  size="sm"
                  className={category === "All" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20">{post.category}</Badge>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </span>
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </span>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* All Posts */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">Latest Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit">
                      {post.category}
                    </Badge>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                  </CardContent>
                  <CardFooter className="text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {post.date}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button variant="outline" size="lg">
                Load More Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 px-4 bg-primary">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-white/80 mb-8">Get the latest tutorials and project ideas delivered to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input placeholder="Enter your email" className="bg-white h-12" />
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8">Subscribe</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
