"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { UniversityPopup } from "@/components/university-popup"
import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { ProductShowcase } from "@/components/landing/product-showcase"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Testimonials } from "@/components/landing/testimonials"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { useAuth } from "@/providers/auth-provider"

export default function LandingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [showUniversityPopup, setShowUniversityPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkRedirection = () => {
      const showLanding = searchParams.get("show_landing")
      const hasVisited = localStorage.getItem("unistore_visited")
      const hasUniversity = localStorage.getItem("unistore_university")

      // If show_landing is explicitly set to "true", always show the landing page
      if (showLanding === "true") {
        setIsLoading(false)
        return
      }

      // If user is authenticated or has selected a university and has visited before,
      // redirect to products page unless explicitly showing landing
      if ((isAuthenticated || hasUniversity) && hasVisited && showLanding !== "true") {
        router.replace("/products")
        return
      }

      // Show university popup for first-time visitors
      if (!hasVisited && !hasUniversity) {
        setShowUniversityPopup(true)
      }

      setIsLoading(false)
    }

    checkRedirection()
  }, [isAuthenticated, router, searchParams])

  // Handle university selection
  const handleSelectUniversity = (universityId: number) => {
    localStorage.setItem("unistore_university", String(universityId))
    localStorage.setItem("unistore_visited", "true")
    setShowUniversityPopup(false)
    router.replace("/products")
  }

  if (isLoading) {
    return null // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* University selection popup */}
      <AnimatePresence>
        {showUniversityPopup && (
          <UniversityPopup
            onClose={() => {
              setShowUniversityPopup(false)
              localStorage.setItem("unistore_visited", "true")
            }}
            onSelect={handleSelectUniversity}
          />
        )}
      </AnimatePresence>

      <Header />

      <motion.main 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
      >
        <Hero />
        {/* <ProductShowcase /> */}
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </motion.main>

      <Footer />
    </div>
  )
} 