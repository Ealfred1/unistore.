"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Phone, Loader2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("+234")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (!value.startsWith("+234")) {
      return
    }
    
    const digits = value.slice(4).replace(/\D/g, "")
    
    if (digits.length > 0 && digits[0] === "0") {
      return
    }
    
    const truncated = digits.slice(0, 10)
    
    setPhoneNumber(`+234${truncated}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!phoneNumber) {
      setError("Please enter your phone number")
      return
    }

    try {
      setIsLoading(true)
      
      // Call the API to send reset code
      await axios.post("/users/auth/reset-password/", { 
        phone_number: phoneNumber 
      })

      // Store phone number in local storage for the next step
      localStorage.setItem("reset_phone_number", phoneNumber)
      
      // Navigate to reset code page
      router.push(`/auth/reset-code?phone=${encodeURIComponent(phoneNumber)}`)
      
      toast.success("Reset code sent to your phone")
    } catch (error: any) {
      console.error(error)
      
      // Handle specific error cases
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else if (error.response?.data?.phone_number) {
        setError(error.response.data.phone_number[0])
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-16 justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <Logo className="text-2xl" />
          </div>

          <div className="mb-8">
            <Link href="/auth/login" className="inline-flex items-center text-sm text-gray-600 hover:text-[#f58220]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold mb-2 text-[#0a2472]">Reset your password</h1>
            <p className="text-gray-600 mb-8">
              Enter your phone number and we'll send you a code to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="pl-10"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <Button type="submit" className="w-full bg-[#f58220] hover:bg-[#f58220]/90" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#f58220]/5 to-[#0a2472]/10 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-lg"
          >
            {/* Decorative elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#f58220]/10 rounded-full"
            />
            <motion.div
              animate={{
                y: [0, 10, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-[#0a2472]/10 rounded-full"
            />

            {/* Main illustration */}
            <div className="relative z-10 bg-white rounded-2xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-[#f58220]/10 rounded-full flex items-center justify-center mb-4">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z"
                      stroke="#f58220"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Forgot your password?</h3>
                <p className="text-gray-600">No worries! It happens to the best of us.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#f58220]/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#f58220] font-medium">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enter your phone number</p>
                    <p className="text-xs text-gray-500">We'll verify your identity</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 font-medium">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enter the reset code</p>
                    <p className="text-xs text-gray-500">We'll send a 6-digit code</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <span className="text-gray-600 font-medium">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reset complete</p>
                    <p className="text-xs text-gray-500">You can now log in</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
