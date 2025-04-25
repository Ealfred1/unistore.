"use client"

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Lottie from 'lottie-react'
import animationData from '@/public/coming.json'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'

export default function ComingSoonPage() {
  const animationRef = useRef(null)
  const router = useRouter()
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background decoration */}

      {/* Content container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-3xl flex flex-col items-center text-center gap-4"
      >
        <Logo />
        {/* Back button
        <Link 
          href="/dashboard"
          className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </Link> */}

        {/* Main content */}
        <div className="space-y-1">
          {/* <h1 className="text-4xl md:text-6xl font-bold text-uniOrange-500 animate-fadeIn">
            Not Available Yet
          </h1> */}
          <p className="text-lg md:text-xl text-uniBlue-500 max-w-xl mx-auto animate-fadeIn delay-200">
            We're working hard to bring you something amazing. Stay tuned!
          </p>
        </div>

        {/* Lottie animation */}
        <div className="w-full max-w-lg animate-float">
          <Lottie 
            lottieRef={animationRef} 
            animationData={animationData}
            className="w-full h-full"
          />
        </div>

        {/* Call to action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-6"
        >
         
            <button onClick={() => router.push("/products")  } className="px-8 py-3 rounded-full bg-gradient-to-r from-uniOrange-500 to-uniOrange-600 text-white font-medium hover:opacity-90 transition-opacity w-full sm:w-auto">
              Go back to products
            </button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <div className="relative mt-9 bottom-8 text-white/60 text-sm">
        © {new Date().getFullYear()} UniStore. All rights reserved.
      </div>
    </div>
  )
} 