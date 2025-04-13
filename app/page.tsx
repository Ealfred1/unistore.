"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UniversityPopup } from "@/components/university-popup"
import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Testimonials } from "@/components/landing/testimonials"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
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
