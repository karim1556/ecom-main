import Link from "next/link"

export function UseCases() {
  const useCases = [
    {
      title: "College Mini Projects",
      description:
        "Complete project kits designed for engineering students. Includes components, documentation, and step-by-step guides for academic submissions.",
      image: "/placeholder.svg?height=320&width=480",
      link: "/shop?category=college",
    },
    {
      title: "Robotics & Automation",
      description:
        "Build intelligent robots and automated systems. Perfect for hobbyists and professionals looking to explore robotics.",
      image: "/placeholder.svg?height=320&width=480",
      link: "/shop?category=robotics",
    },
    {
      title: "IoT & Smart Home",
      description:
        "Create connected devices and smart home solutions. Includes WiFi modules, sensors, and cloud integration guides.",
      image: "/placeholder.svg?height=320&width=480",
      link: "/shop?category=iot",
    },
    {
      title: "Research & Prototyping",
      description:
        "Advanced components for research projects and rapid prototyping. Ideal for R&D labs and innovation centers.",
      image: "/placeholder.svg?height=320&width=480",
      link: "/shop?category=research",
    },
    {
      title: "School Science Fair",
      description:
        "Engaging science fair project kits for students. Easy to assemble with impressive results for competitions.",
      image: "/placeholder.svg?height=320&width=480",
      link: "/shop?category=school",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Shop by Use Case</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the right project kit for your purpose — whether you're building for academics, racing through ideas,
            or innovating at your lab.
          </p>
        </div>

        <div className="space-y-16">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row gap-8 lg:gap-16 items-center ₹{
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1 space-y-6">
                <h3 className="text-2xl lg:text-3xl font-bold text-primary">{useCase.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                <Link
                  href={useCase.link}
                  className="inline-flex px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition font-semibold shadow-lg shadow-accent/20"
                >
                  View Projects
                </Link>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl" />
                  <img
                    src={useCase.image || "/placeholder.svg"}
                    alt={useCase.title}
                    className="relative w-full rounded-2xl shadow-xl"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
