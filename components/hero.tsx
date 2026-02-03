import Link from "next/link"

export function Hero() {
  return (
    <section className="bg-background py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                Innovative Tech Projects
                <br />
                <span className="text-accent">for Every Learner</span>
              </h1>
            </div>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              Explore high-performance components, STEM kits, IoT projects, robotics modules and more — all backed by
              expert support and fast shipping.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-semibold shadow-lg shadow-primary/25"
              >
                Shop Projects
              </Link>
              <Link
                href="#categories"
                className="px-8 py-3.5 border-2 border-border text-foreground rounded-lg hover:bg-muted transition font-semibold"
              >
                Explore Categories
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-2xl" />
              <img
                src="/placeholder.svg?height=450&width=500"
                alt="Tech Project Kit"
                className="relative w-full max-w-md rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
