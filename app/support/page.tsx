import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Search, Package, RefreshCw, CreditCard, HelpCircle, MessageCircle, Mail, Phone } from "lucide-react"
import Link from "next/link"

const supportCategories = [
  {
    icon: Package,
    title: "Orders & Shipping",
    description: "Track orders, shipping info, delivery issues",
    link: "#orders",
  },
  {
    icon: RefreshCw,
    title: "Returns & Refunds",
    description: "Return policy, refund process, exchanges",
    link: "#returns",
  },
  {
    icon: CreditCard,
    title: "Payments",
    description: "Payment methods, failed transactions, invoices",
    link: "#payments",
  },
  {
    icon: HelpCircle,
    title: "Product Help",
    description: "Product guides, tutorials, technical support",
    link: "#product",
  },
]

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, you'll receive an email with a tracking link. You can also track your order by logging into your account and visiting the 'My Orders' section.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer a 7-day return policy for all products. Items must be unused and in original packaging. Simply initiate a return from your dashboard, and our team will arrange pickup.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 3-5 business days for most locations. Metro cities may receive orders in 2-3 days. Express delivery (1-2 days) is available for select pin codes.",
  },
  {
    question: "Do you provide project guidance?",
    answer:
      "Yes! Each product comes with documentation and tutorials. For additional help, you can access our community forum or contact our technical support team.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit/debit cards, UPI, net banking, and popular wallets like Paytm and PhonePe. Cash on Delivery is available for orders under ₹5,000.",
  },
  {
    question: "Do you offer bulk discounts for colleges?",
    answer:
      "We offer special pricing for educational institutions. Contact our sales team with your requirements, and we'll provide a customized quote.",
  },
  {
    question: "Are the products genuine and tested?",
    answer:
      "Yes, all our products are sourced from authorized distributors and tested before shipping. We provide a quality guarantee on every item.",
  },
  {
    question: "How do I cancel an order?",
    answer:
      "You can cancel an order before it's shipped from your dashboard. For orders already shipped, you'll need to initiate a return after delivery.",
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 border-b border-border py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How Can We <span className="text-primary">Help?</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search for help..." className="pl-12 h-14 text-lg" />
            </div>
          </div>
        </section>

        {/* Support Categories */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportCategories.map((category, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer group hover:border-primary"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                      <category.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{category.title}</h3>
                    <p className="text-muted-foreground text-sm">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Quick answers to common questions</p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-₹{index}`} className="bg-background rounded-lg border px-6">
                  <AccordionTrigger className="text-left font-medium hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Still Need Help?</h2>
              <p className="text-muted-foreground">Our support team is here to assist you</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Live Chat</h3>
                  <p className="text-muted-foreground text-sm mb-4">Chat with our support team in real-time</p>
                  <p className="text-sm text-primary font-medium mb-4">Available 9 AM - 9 PM IST</p>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Start Chat</Button>
                </CardContent>
              </Card>

              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Email Support</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Send us an email and we'll respond within 24 hours
                  </p>
                  <p className="text-sm text-primary font-medium mb-4">support@discoverprojects.com</p>
                  <Button variant="outline" asChild>
                    <Link href="mailto:support@discoverprojects.com">Send Email</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Phone Support</h3>
                  <p className="text-muted-foreground text-sm mb-4">Speak directly with our support team</p>
                  <p className="text-sm text-primary font-medium mb-4">+91 1800-123-4567</p>
                  <Button variant="outline" asChild>
                    <Link href="tel:+911800123456">Call Now</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
