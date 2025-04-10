"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PartyPopper, ArrowRight } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default function WelcomePage() {
  const router = useRouter()
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Show the button after a delay
    const timer = setTimeout(() => {
      setShowButton(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Logo size="lg" className="mb-12" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                className="w-24 h-24 rounded-full bg-[#f58220]/20 flex items-center justify-center"
              >
                <PartyPopper className="h-12 w-12 text-[#f58220]" />
              </motion.div>

              {/* Animated confetti particles */}
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 200 - 100,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: Math.random() * 2,
                  }}
                  className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
                    zIndex: -1,
                  }}
                />
              ))}
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Account Created Successfully!
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="text-gray-600 text-lg max-w-md mx-auto mb-8"
          >
            Welcome to UniStore! Your account has been created and you're ready to start exploring.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: showButton ? 1 : 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Link href="/auth/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-[#f58220] text-white font-medium rounded-xl hover:bg-[#f58220]/90 transition-all flex items-center"
              >
                Proceed to Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
