import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Target, Eye, Heart, Users, Award, Truck, ShieldCheck, Headphones } from "lucide-react"
import Link from "next/link"

const stats = [
  { number: "50,000+", label: "Happy Students" },
  { number: "1,000+", label: "Products" },
  { number: "500+", label: "Colleges" },
  { number: "99%", label: "Satisfaction" },
]

const team = [
  {
    name: "Rajesh Kumar",
    role: "Founder & CEO",
    image: "/placeholder.svg?height=300&width=300",
    bio: "IIT Delhi alumnus with 15+ years in EdTech",
  },
  {
    name: "Priya Sharma",
    role: "Head of Operations",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Ex-Amazon with expertise in supply chain",
  },
  {
    name: "Amit Patel",
    role: "Technical Director",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Electronics engineer passionate about STEM",
  },
  {
    name: "Sneha Reddy",
    role: "Customer Success",
    image: "/placeholder.svg?height=300&width=300",
    bio: "Dedicated to helping students succeed",
  },
]

const values = [
  {
    icon: Target,
    title: "Quality First",
    description: "Every product is tested and verified for educational excellence",
  },
  {
    icon: Heart,
    title: "Student-Centric",
    description: "Affordable pricing and resources designed for student success",
  },
  {
    icon: Eye,
    title: "Innovation",
    description: "Constantly updating our catalog with the latest STEM technologies",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building a network of learners, makers, and innovators",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 border-b border-border py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="text-primary">DiscoverProjects</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Empowering the next generation of innovators with quality STEM products and resources. We believe every
              student deserves access to the tools they need to bring their ideas to life.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 bg-primary">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">{stat.number}</div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    DiscoverProjects was born from a simple observation: talented students across India were struggling
                    to find quality components for their engineering projects at affordable prices.
                  </p>
                  <p>
                    Founded in 2020 by a group of IIT graduates, we set out to bridge this gap. What started as a small
                    online store has grown into India's most trusted platform for STEM education materials.
                  </p>
                  <p>
                    Today, we serve over 50,000 students from 500+ colleges, providing everything from basic electronic
                    components to advanced robotics kits. Our mission remains the same: make quality STEM resources
                    accessible to every aspiring engineer and scientist.
                  </p>
                </div>
                <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">Learn More About Our Journey</Button>
              </div>
              <div className="relative">
                <img
                  src="/placeholder.svg?height=500&width=600"
                  alt="Students working on projects"
                  className="rounded-2xl shadow-xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
                  <div className="text-3xl font-bold">5+</div>
                  <div className="text-sm">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">The principles that guide everything we do</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Passionate professionals dedicated to empowering student innovators
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold text-foreground">{member.name}</h3>
                    <p className="text-primary text-sm mb-2">{member.role}</p>
                    <p className="text-muted-foreground text-xs">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose DiscoverProjects?</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center p-6">
                <Award className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-bold text-foreground mb-2">Quality Assured</h3>
                <p className="text-muted-foreground text-sm">Every product tested before shipping</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <Truck className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-bold text-foreground mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground text-sm">Pan-India delivery in 3-5 days</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <ShieldCheck className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-bold text-foreground mb-2">Secure Payments</h3>
                <p className="text-muted-foreground text-sm">100% secure payment gateway</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <Headphones className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-bold text-foreground mb-2">24/7 Support</h3>
                <p className="text-muted-foreground text-sm">Expert help whenever you need</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-primary">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Project?</h2>
            <p className="text-white/80 mb-8">
              Browse our collection of quality STEM products and bring your ideas to life
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary-foreground hover:bg-primary-foreground/90 text-primary">
                <Link href="/shop">Explore Products</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
