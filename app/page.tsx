"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  const { isAuthenticated } = useAuth()
  const [showUniversityPopup, setShowUniversityPopup] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Parse URL parameters without using useSearchParams
  const getUrlParam = (paramName: string): string | null => {
    if (typeof window === "undefined") return null
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(paramName)
  }

  useEffect(() => {
    const checkRedirection = () => {
      const showLanding = getUrlParam("show_landing")
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
  }, [isAuthenticated, router])

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
    <div className="min-h-screen overflow-x-hidden flex flex-col relative">
      <Header />
      <div className="w-full h-screen flex items-center justify-center overflow-hidden">
        <AnimatePresence>
          {showUniversityPopup && (
            <div className="fixed top-0 left-0 w-full h-screen inset-0 z-50 overflow-x-hidden">
              <UniversityPopup
                onClose={() => {
                  setShowUniversityPopup(false)
                  localStorage.setItem("unistore_visited", "true")
                }}
                onSelect={handleSelectUniversity}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </motion.main>

      <Footer />
    </div>
  )
}