"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, ArrowRight, Lock, Shield, User } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default function ResetSuccessPage() {
  const router = useRouter()
  const [showButton, setShowButton] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Show the button immediately
    setShowButton(true)

    // Auto-redirect countdown
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      router.push("/auth/login")
    }
  }, [countdown, router])

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Logo className="text-2xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
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
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
                >
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </motion.div>

                {/* Animated success particles */}
                {Array.from({ length: 12 }).map((_, i) => (
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
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#10b981" : "#f59e0b",
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
              className="text-3xl md:text-4xl font-bold mb-4 text-[#0a2472]"
            >
              Password Reset Successful!
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-gray-600 text-lg max-w-md mx-auto mb-8"
            >
              Your password has been reset successfully. You can now log in with your new password.
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

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="text-sm text-gray-500 mt-4"
            >
              Redirecting in {countdown} seconds...
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Animated illustration */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-lg"
          >
            {/* Background elements */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute -top-10 right-20 w-40 h-40 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />
            <motion.div
              animate={{
                y: [0, 15, 0],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute top-40 -left-10 w-60 h-60 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />
            <motion.div
              animate={{
                x: [0, 15, 0],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute bottom-20 right-10 w-36 h-36 bg-[#f58220]/20 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            />

            {/* Main illustration */}
            <div className="relative z-10">
              <motion.div
                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Security Restored</h3>
                  <p className="text-gray-600">Your account is now secure</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Password Reset Complete</p>
                      <p className="text-sm text-gray-500">Your account is now secure</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Account Protected</p>
                      <p className="text-sm text-gray-500">Enhanced security measures active</p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-[#f58220]/10 rounded-lg border border-[#f58220]/20">
                    <div className="w-10 h-10 bg-[#f58220]/20 rounded-full flex items-center justify-center mr-4">
                      <User className="h-5 w-5 text-[#f58220]" />
                    </div>
                    <div>
                      <p className="font-medium">Ready to Login</p>
                      <p className="text-sm text-gray-500">Use your new credentials</p>
                    </div>
                  </div>
                </div>

                {/* Animated success checkmark */}
                <motion.div
                  className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-full border border-green-100 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 1,
                  }}
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <motion.path
                        d="M20 6L9 17L4 12"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Floating elements */}
              <motion.div
                className="absolute -bottom-6 -left-6 bg-white p-3 rounded-xl border border-gray-100 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Password Reset</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
