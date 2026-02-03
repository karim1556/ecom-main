import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { FeaturedProducts } from "@/components/featured-products"
import { Categories } from "@/components/categories"
import { WhyShopWithUs } from "@/components/why-shop"
import { UseCases } from "@/components/use-cases"
import { Testimonials } from "@/components/testimonials"
import { Newsletter } from "@/components/newsletter"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeaturedProducts />
        <Categories />
        <WhyShopWithUs />
        <UseCases />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  )
}
