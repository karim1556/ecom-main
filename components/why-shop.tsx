import { Truck, HeadphonesIcon, Wrench, ShieldCheck } from "lucide-react"

export function WhyShopWithUs() {
  const features = [
    {
      icon: Truck,
      title: "Fast Shipping",
      description: "Free delivery on orders over ₹50. Quick and reliable shipping.",
    },
    {
      icon: HeadphonesIcon,
      title: "Expert Support",
      description: "Dedicated team ready to help with your projects.",
    },
    {
      icon: Wrench,
      title: "Verified Quality",
      description: "All products tested and verified for quality.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Payments",
      description: "Industry-grade security for all transactions.",
    },
  ]

  return (
    <section className="py-20 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-16">Why Shop With Us</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-2xl mb-6 group-hover:bg-accent/10 transition">
                <feature.icon className="w-8 h-8 text-primary group-hover:text-accent transition" />
              </div>
              <h3 className="font-bold text-primary mb-3 text-lg">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
