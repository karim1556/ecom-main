import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search, ShoppingBag } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              <span className="text-[150px] md:text-[200px] font-bold text-muted/20 leading-none select-none">404</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-accent/10 flex items-center justify-center">
                  <Search className="w-12 h-12 md:w-16 md:h-16 text-accent" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8 text-base md:text-lg">
            Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/shop">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Shop
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground mb-4">Here are some helpful links:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/about" className="text-primary hover:text-primary/80 hover:underline transition">
                About Us
              </Link>
              <Link href="/support" className="text-primary hover:text-primary/80 hover:underline transition">
                Support
              </Link>
              <Link href="/contact" className="text-primary hover:text-primary/80 hover:underline transition">
                Contact
              </Link>
              <Link href="/blog" className="text-primary hover:text-primary/80 hover:underline transition">
                Blog
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="py-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Return to DiscoverProjects.com
        </Link>
      </div>
    </div>
  )
}
