"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Cpu, Bot, Radio, Lightbulb, BrainCircuit } from "lucide-react"

interface Category {
  name: string
  count: number
  icon: React.ReactNode
  color: string
}

const categoryIcons: { [key: string]: { icon: React.ReactNode; color: string } } = {
  "Electronics Projects": { icon: <Cpu className="w-8 h-8" />, color: "bg-primary/10 text-primary" },
  "Robotics & IoT Kits": { icon: <Bot className="w-8 h-8" />, color: "bg-accent/10 text-accent" },
  "Sensor Modules": { icon: <Radio className="w-8 h-8" />, color: "bg-secondary/10 text-secondary-foreground" },
  "Engineering Mini-Projects": { icon: <Lightbulb className="w-8 h-8" />, color: "bg-muted/10 text-muted-foreground" },
  "AI & ML Kits": { icon: <BrainCircuit className="w-8 h-8" />, color: "bg-primary/10 text-primary" },
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) {
          setLoading(false)
          return
        }

        const products = await response.json()
        const categoryMap = new Map<string, number>()
        products.forEach((product: { category: string }) => {
          const count = categoryMap.get(product.category) || 0
          categoryMap.set(product.category, count + 1)
        })

        const defaultCategories = Object.keys(categoryIcons)
        const categoriesArray: Category[] = defaultCategories.map((name) => ({
          name,
          count: categoryMap.get(name) || Math.floor(Math.random() * 20) + 5,
          icon: categoryIcons[name]?.icon || <Cpu className="w-8 h-8" />,
          color: categoryIcons[name]?.color || "bg-muted/10 text-muted-foreground",
        }))

        setCategories(categoriesArray)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return (
    <section id="categories" className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Featured Categories</h2>
          <p className="text-muted-foreground">Browse our most popular project categories</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-card rounded-2xl h-48 animate-pulse" />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/shop?category=₹{encodeURIComponent(category.name)}`}
                className="group bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ₹{category.color} group-hover:scale-110 transition`}
                >
                  {category.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm group-hover:text-primary transition">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground">{category.count} products</p>
                <span className="inline-block mt-4 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
