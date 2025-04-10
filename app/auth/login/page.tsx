"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Eye, EyeOff, ArrowRight, LogIn, Facebook, Twitter } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { toast } from "sonner"

export default function LoginPage() {
  const [phone_number, setPhoneNumber] = useState("+234")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone_number || !password) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      await login({ phone_number, password })
      toast.success("Login successful! Redirecting to dashboard...")
      router.push("/dashboard")
    } catch (error: any) {
      console.error(error)
      
      // Handle different error scenarios
      if (error.response?.status === 401) {
        toast.error("Invalid credentials. Please check your phone number and password.")
      } else if (error.response?.status === 400) {
        // Handle validation errors
        const errorData = error.response.data
        if (typeof errorData === 'object') {
          // Extract field-specific errors
          Object.entries(errorData).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              toast.error(`${field}: ${messages[0]}`)
            }
          })
        } else {
          toast.error("Invalid input. Please check your details.")
        }
      } else if (error.response?.data?.detail) {
        // API returned a specific error message
        toast.error(error.response.data.detail)
      } else if (error.message === "Network Error") {
        toast.error("Network error. Please check your internet connection.")
      } else {
        // Fallback error message
        toast.error("Login failed. Please try again later.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Logo className="text-2xl" />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold mb-2">Login to Your Account!</h1>
            <p className="text-gray-600 mb-8">Sign in to your account to continue</p>

            <div className="flex space-x-3 mb-6">
              <button className="flex-1 flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Facebook className="h-5 w-5 text-[#1877F2] mr-2" />
                Facebook
              </button>
              <button className="flex-1 flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Twitter className="h-5 w-5 text-[#1DA1F2] mr-2" />
                Twitter
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">OR</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone_number}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
                  placeholder="+234 XXX XXX XXXX"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-sm text-[#f58220] hover:text-[#f58220]/80">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#f58220] focus:ring-[#f58220] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember Me
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-[#f58220] text-white font-medium rounded-xl hover:bg-[#f58220]/90 transition-all flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="h-5 w-5 mr-2" />
                    Login To Your Account
                  </div>
                )}
              </motion.button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-[#f58220] hover:text-[#f58220]/80 inline-flex items-center"
              >
                Signup <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </p>
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
                      <svg className="h-5 w-5 text-[#f58220]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Dashboard</p>
                      <p className="text-xs text-gray-500">Student Marketplace</p>
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
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                        <img
                          src="/placeholder.svg?height=40&width=40&text=Product"
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">MacBook Pro</p>
                        <p className="text-xs text-gray-500">$1,299.00</p>
                      </div>
                    </div>
                    <div className="bg-[#f58220]/10 text-[#f58220] text-xs px-2 py-1 rounded-full">New</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                        <img
                          src="/placeholder.svg?height=40&width=40&text=Product"
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">iPhone 13</p>
                        <p className="text-xs text-gray-500">$799.00</p>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">Popular</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#0a2472]/10 flex items-center justify-center">
                    <svg className="h-4 w-4 text-[#0a2472]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium">Payment Successful</p>
                    <p className="text-xs text-gray-500">2 min ago</p>
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

