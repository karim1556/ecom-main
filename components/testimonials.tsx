import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Rahul S.",
      role: "Engineering Student",
      rating: 5,
      text: "The project kits are incredibly well-documented. Helped me complete my final year project ahead of schedule. Highly recommend for students!",
    },
    {
      name: "Priya M.",
      role: "IoT Developer",
      rating: 5,
      text: "Great selection of IoT components. Fast delivery and excellent customer support when I needed help with my smart home project.",
    },
    {
      name: "Arjun K.",
      role: "Robotics Enthusiast",
      rating: 5,
      text: "Found everything I needed for my robotics competition. Quality components at fair prices. This is now my go-to store!",
    },
  ]

  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-16">What Our Customers Are Saying</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">{testimonial.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-primary">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
