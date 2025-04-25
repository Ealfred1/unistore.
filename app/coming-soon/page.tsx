"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/ui/logo'

// Dynamically import Lottie with no SSR
const Lottie = dynamic(() => import('lottie-react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="animate-pulse w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700" />
    </div>
  ),
})

export default function ComingSoonPage() {
  const animationRef = useRef(null)
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true)
  }, [])

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

        {/* Only render Lottie on client side */}
        {isClient && (
          <div className="w-full max-w-lg animate-float">
            <Lottie 
              lottieRef={animationRef} 
              animationData={require('@/public/coming.json')}
              className="w-full h-full"
            />
          </div>
        )}

        {/* Call to action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="space-y-6"
        >
         
            <button 
              onClick={() => router.push("/products")} 
              className="px-8 py-3 rounded-full bg-gradient-to-r from-uniOrange-500 to-uniOrange-600 text-white font-medium hover:opacity-90 transition-opacity w-full sm:w-auto"
            >
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