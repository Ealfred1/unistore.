"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PartyPopper, ArrowRight, CheckCircle, User, ShoppingBag, Bell } from "lucide-react"
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
      {/* Left side - Welcome content */}
      <div className="w-full flex items-center justify-center p-8 md:p-16 order-2 md:order-1 md:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Logo className="text-2xl" />
          </div>

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
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#f58220]/20 flex items-center justify-center"
                >
                  <PartyPopper className="h-10 w-10 md:h-12 md:w-12 text-[#f58220]" />
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
                      x: Math.random() * 160 - 80,
                      y: Math.random() * 160 - 80,
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: Math.random() * 2,
                    }}
                    className="absolute top-1/2 left-1/2 w-2 md:w-3 h-2 md:h-3 rounded-full"
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
              className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4"
            >
              Account Created Successfully!
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-gray-600 text-base md:text-lg max-w-md mx-auto mb-8"
            >
              Welcome to UniStore! Your account has been created and you're ready to start exploring.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: showButton ? 1 : 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex justify-center w-full"
            >
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 md:px-8 py-3 bg-[#f58220] text-white font-medium rounded-xl hover:bg-[#f58220]/90 transition-all flex items-center"
                >
                  Explore UniStore
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Image and animated background - Now shown on top on mobile */}
      <div className="w-full md:w-1/2 bg-white relative overflow-hidden order-1 md:order-2 min-h-[300px] md:min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f58220]/5 to-[#0a2472]/5"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
              <span className="text-[#f58220]">Uni</span>
              <span className="text-[#0a2472]">store</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-md mx-auto mb-4 md:mb-0">
              The ultimate e-commerce platform for university students. Connect, buy, and sell with your peers.
            </p>

            <motion.div
              className="mt-6 md:mt-12 w-full max-w-md mx-auto relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-xl border border-gray-100 scale-[0.85] md:scale-100 transform-origin-top">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-[#f58220]/10 flex items-center justify-center">
                      <User className="h-4 md:h-5 w-4 md:w-5 text-[#f58220]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-base">Account Setup</p>
                      <p className="text-xs text-gray-500">Registration Complete</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white overflow-hidden">
                        <img
                          src={`/generic-user-icon.png?height=32&width=32&text=User+${i}`}
                          alt={`User ${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="bg-green-50 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-green-100 flex items-center justify-center mr-2 md:mr-3">
                        <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm md:text-base">Account Created</p>
                        <p className="text-xs text-gray-500">Your account is ready</p>
                      </div>
                    </div>
                    <div className="bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded-full">Completed</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2 md:p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gray-100 flex items-center justify-center mr-2 md:mr-3">
                        <ShoppingBag className="h-4 md:h-5 w-4 md:w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm md:text-base">Explore Products</p>
                        <p className="text-xs text-gray-500">Find what you need</p>
                      </div>
                    </div>
                    <div className="bg-blue-500/10 text-blue-600 text-xs px-2 py-1 rounded-full">Next Step</div>
                  </div>

                  <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-xs md:text-sm text-gray-500">Setup Progress</p>
                      <p className="font-bold text-sm md:text-base">33%</p>
                    </div>
                    <div className="mt-1 md:mt-2 h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-[#f58220] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-3 md:-bottom-4 -right-3 md:-right-4 bg-white rounded-xl p-2 md:p-3 shadow-lg border border-gray-100 scale-[0.85] md:scale-100">
                <div className="flex items-center space-x-2">
                  <div className="w-6 md:w-8 h-6 md:h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bell className="h-3 md:h-4 w-3 md:w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Welcome to UniStore!</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
