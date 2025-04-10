"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, ShoppingBag, Users, Shield, ChevronRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { UniversityPopup } from "@/components/university-popup"

export default function LandingPage() {
  const [showUniversityPopup, setShowUniversityPopup] = useState(false)

  // Check if it's the first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem("unistore_visited")
    if (!hasVisited) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setShowUniversityPopup(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Handle university selection
  const handleSelectUniversity = (universityId: number) => {
    // In a real app, you would store the selected university in state/context
    // and use it to filter products, etc.
    console.log("Selected university:", universityId)

    // Mark as visited
    localStorage.setItem("unistore_visited", "true")

    // Close popup
    setShowUniversityPopup(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* University selection popup */}
      {showUniversityPopup && (
        <UniversityPopup
          onClose={() => {
            setShowUniversityPopup(false)
            localStorage.setItem("unistore_visited", "true")
          }}
          onSelect={handleSelectUniversity}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-b-gray-100 bg-white/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Logo size="lg" />
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-[#f58220] transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-[#f58220] transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-[#f58220] transition-colors">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline" className="hidden bg-transparent sm:flex">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-[#0a2472] text-white hover:bg-[#0a2472]/90">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-white py-20 md:py-32 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-[#f58220]/10 px-3 py-1 text-sm text-[#f58220]">
                Campus Marketplace
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                <span className="text-[#f58220]">Uni</span>
                <span className="text-[#0a2472]">store</span>: Your Campus Marketplace
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Buy, sell, and discover products within your university community. Connect with fellow students and find
                what you need.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/auth/signup">
                  <Button className="bg-[#0a2472] text-white hover:bg-[#0a2472]/90">
                    Get Started
                    <ArrowRight className="ml-2 text-white bg-transparent h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button className="bg-transparent" variant="outline">Learn More</Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto lg:ml-auto flex items-center justify-center">
              <div className="relative w-full max-w-[500px] aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-[#f58220]/20 to-[#0a2472]/20 rounded-2xl transform rotate-3 scale-105"></div>
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-[#0a2472] flex items-center justify-center text-white">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Campus Store</p>
                          <p className="text-sm text-gray-500">Trending Items</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center"
                        >
                          <div className="w-full h-full bg-gradient-to-br from-[#f58220]/10 to-[#0a2472]/10 rounded-md animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">View all items</p>
                        <ArrowRight className="h-4 w-4 text-[#f58220]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-[#0a2472]/10 px-3 py-1 text-sm text-[#0a2472]">Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Everything You Need</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover the tools and features that make <span className="text-[#f58220]">Uni</span>
                <span className="text-[#0a2472]">store</span> the perfect marketplace for university students.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
            {[
              {
                icon: <ShoppingBag className="h-10 w-10 text-[#f58220]" />,
                title: "Buy & Sell",
                description: "Easily list items for sale or find what you need from fellow students.",
              },
              {
                icon: <Users className="h-10 w-10 text-[#f58220]" />,
                title: "University Network",
                description: "Connect with students from your university in a safe, verified community.",
              },
              {
                icon: <Shield className="h-10 w-10 text-[#f58220]" />,
                title: "Secure Transactions",
                description: "Our platform ensures safe and transparent transactions between users.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-4 rounded-lg border-gray-300 p-6 bg-white shadow-sm"
              >
                <div className="p-3 rounded-full bg-[#f58220]/10">{feature.icon}</div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-gray-500 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-[#f58220]/10 px-3 py-1 text-sm text-[#f58220]">
                How It Works
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Simple & Easy to Use</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Get started in minutes and experience the future of university commerce.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12 items-center mt-12">
            <div className="space-y-8">
              {[
                {
                  number: "01",
                  title: "Create Your Account",
                  description: "Sign up with your university email and set up your profile in just a few minutes.",
                },
                {
                  number: "02",
                  title: "Browse or List Products",
                  description:
                    "Explore products from fellow students or list your own items for sale with just a few clicks.",
                },
                {
                  number: "03",
                  title: "Connect and Transact",
                  description: "Chat with buyers or sellers, negotiate prices, and complete secure transactions.",
                },
              ].map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-[#0a2472] text-white font-bold">
                    {step.number}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-gray-500">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#f58220]/20 to-[#0a2472]/20 rounded-2xl transform -rotate-3 scale-105"></div>
              <div className="relative bg-white rounded-2xl shadow-sm overflow-hidden border">
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="h-6 w-6 text-[#0a2472]" />
                      </div>
                      <div>
                        <h4 className="font-medium">University Community</h4>
                        <p className="text-sm text-gray-500">Connect with fellow students</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                          <div className="flex-1">
                            <div className="h-2.5 w-24 bg-gray-200 rounded-full"></div>
                            <div className="h-2 w-16 bg-gray-200 rounded-full mt-2"></div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="h-6 w-16 bg-[#f58220]/20 rounded-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-[#0a2472]/10 px-3 py-1 text-sm text-[#0a2472]">
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Students Say</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Hear from students who have transformed their university experience with{" "}
                <span className="text-[#f58220]">Uni</span>
                <span className="text-[#0a2472]">store</span>.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-12">
            {[
              {
                quote:
                  "UniStore made it so easy to sell my old textbooks and find the ones I needed for the new semester. Saved me a lot of money!",
                name: "Sarah Johnson",
                role: "Computer Science, Year 3",
                rating: 5,
              },
              {
                quote:
                  "I requested a specific calculator model for my engineering class, and within hours I had multiple offers. The platform is amazing!",
                name: "Michael Chen",
                role: "Mechanical Engineering, Year 2",
                rating: 5,
              },
              {
                quote:
                  "As a student entrepreneur, UniStore has been the perfect platform to reach other students with my products. The community is supportive!",
                name: "Olivia Martinez",
                role: "Business Administration, Year 4",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="flex flex-col justify-between rounded-lg border p-6 bg-white shadow-sm">
                <div className="space-y-4">
                  <div className="flex">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-[#f58220] text-[#f58220]" />
                    ))}
                  </div>
                  <p className="text-gray-500 italic">"{testimonial.quote}"</p>
                </div>
                <div className="flex items-center space-x-3 pt-4 mt-4 border-t">
                  <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#0a2472]">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h2 className="text-3xl text-white font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
              <p className="max-w-[600px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of students who are already using <span className="text-[#f58220]">Uni</span>store to
                buy, sell, and connect.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
              <Link href="/auth/signup">
                <Button className="bg-[#f58220] hover:bg-[#f58220]/90 text-white">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="text-white bg-transparent border-white hover:bg-white/10">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <Logo size="lg" />
              <p className="text-gray-500">The ultimate e-commerce platform for university students.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-gray-500 hover:text-[#f58220]">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-gray-500 hover:text-[#f58220]">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="#testimonials" className="text-gray-500 hover:text-[#f58220]">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-[#f58220]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-[#f58220]">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-[#f58220]">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-500 hover:text-[#f58220]">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-[#f58220]">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:text-[#f58220]">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} <span className="text-[#f58220]">Uni</span>
              <span className="text-[#0a2472]">store</span>. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="text-gray-500 hover:text-[#f58220]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-[#f58220]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-[#f58220]">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
