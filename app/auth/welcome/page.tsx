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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left side - Welcome content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          {/* <div className="mb-8">
            <Logo className="text-2xl" />
          </div> */}

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
              className="flex justify-center w-full"
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

      {/* Right side - Image and animated background */}
      <div className="hidden md:block md:w-1/2 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f58220]/5 to-[#0a2472]/5"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-6">
              <span className="text-[#f58220]">Uni</span>
              <span className="text-[#0a2472]">store</span>
            </h1>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              The ultimate e-commerce platform for university students. Connect, buy, and sell with your peers.
            </p>

            <motion.div
              className="mt-12 w-full max-w-md mx-auto relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-[#f58220]/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-[#f58220]" />
                    </div>
                    <div>
                      <p className="font-medium">Account Setup</p>
                      <p className="text-xs text-gray-500">Registration Complete</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                        <img
                          src={`/placeholder.svg?height=32&width=32&text=User+${i}`}
                          alt={`User ${i}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Account Created</p>
                        <p className="text-xs text-gray-500">Your account is ready</p>
                      </div>
                    </div>
                    <div className="bg-green-500/10 text-green-600 text-xs px-2 py-1 rounded-full">Completed</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                        <ShoppingBag className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium">Explore Products</p>
                        <p className="text-xs text-gray-500">Find what you need</p>
                      </div>
                    </div>
                    <div className="bg-blue-500/10 text-blue-600 text-xs px-2 py-1 rounded-full">Next Step</div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Setup Progress</p>
                      <p className="font-bold">33%</p>
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-[#f58220] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-blue-600" />
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
