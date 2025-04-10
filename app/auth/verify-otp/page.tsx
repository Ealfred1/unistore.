"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { ArrowLeft, CheckCircle, MessageSquare, Shield, Smartphone } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const [resendCountdown, setResendCountdown] = useState(60)
  const [phoneNumber, setPhoneNumber] = useState("")
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { verifyOtp } = useAuth()
  const router = useRouter()

  // Get phone number from local storage on component mount
  useEffect(() => {
    const storedPhoneNumber = localStorage.getItem("verification_phone_number")
    if (storedPhoneNumber) {
      setPhoneNumber(storedPhoneNumber)
    } else {
      // If no phone number is found, redirect back to signup
      router.push("/auth/signup")
    }
  }, [router])

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  // Handle OTP input change
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0)
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle key down events (backspace, arrow keys)
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    if (!/^\d+$/.test(pastedData)) {
      return
    }

    const digits = pastedData.slice(0, 6).split("")
    const newOtp = [...otp]

    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit
      }
    })

    setOtp(newOtp)

    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((val) => !val)
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[5]?.focus()
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits of the OTP")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      // Pass the phone number from state to verifyOtp
      const isValid = await verifyOtp(otpValue, phoneNumber)

      if (isValid) {
        setIsVerified(true)
        // Clear the stored phone number after successful verification
        localStorage.removeItem("verification_phone_number")
        setTimeout(() => {
          router.push("/auth/select-university")
        }, 2000)
      } else {
        setError("Invalid OTP. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
      console.error(error)
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle resend OTP
  const handleResend = () => {
    // In a real app, you would call an API to resend the OTP
    setResendCountdown(60)
    // Show a success message
    setError("")
    alert("A new OTP has been sent to your phone")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left side - OTP verification form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Logo className="text-2xl" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-8"
          >
            <Link href="/auth/signup" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </Link>

            <h1 className="text-2xl font-bold mb-2">Verify Your Phone</h1>
            <p className="text-gray-600 mb-6">
              We've sent a 6-digit verification code to your phone. Enter the code below to verify your account.
            </p>

            {isVerified ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Verification Successful!</h2>
                <p className="text-gray-500 text-center mb-4">
                  Your phone number has been verified successfully. Redirecting...
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex justify-center space-x-3 mb-6">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
                    />
                  ))}
                </div>

                {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

                <motion.button
                  type="submit"
                  disabled={isVerifying || otp.some((digit) => !digit)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-4 bg-[#f58220] text-white font-medium rounded-xl hover:bg-[#f58220]/90 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify OTP"
                  )}
                </motion.button>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-sm">
                    Didn't receive the code?{" "}
                    {resendCountdown > 0 ? (
                      <span className="text-gray-500">Resend in {resendCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-[#f58220] font-medium hover:text-[#f58220]/80"
                      >
                        Resend Code
                      </button>
                    )}
                  </p>
                </div>
              </form>
            )}
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
              Secure verification ensures your account is protected and your transactions are safe.
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
                      <Shield className="h-5 w-5 text-[#f58220]" />
                    </div>
                    <div>
                      <p className="font-medium">Security Center</p>
                      <p className="text-xs text-gray-500">Account Verification</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Phone Verification</p>
                      <p className="text-xs text-gray-500">Verify your phone number</p>
                    </div>
                    <div className="ml-auto">
                      <div className="bg-amber-500/10 text-amber-600 text-xs px-2 py-1 rounded-full">In Progress</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 flex items-center opacity-50">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      <MessageSquare className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium">Profile Setup</p>
                      <p className="text-xs text-gray-500">Complete your profile</p>
                    </div>
                    <div className="ml-auto">
                      <div className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">Pending</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">Verification Progress</p>
                      <p className="font-bold">50%</p>
                    </div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-[#f58220] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-3 shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium">SMS Sent Successfully</p>
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
