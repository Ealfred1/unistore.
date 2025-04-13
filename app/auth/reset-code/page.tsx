"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, RefreshCw, Loader2, Eye, EyeOff } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from "@/lib/axios"
import { toast } from "sonner"

export default function ResetCodePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone") || localStorage.getItem("reset_phone_number") || ""
  
  const [step, setStep] = useState(1) // Step 1: Verification code, Step 2: New password
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0)
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    if (/^\d+$/.test(pastedData) && pastedData.length <= 6) {
      const newCode = [...code]

      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) {
          newCode[i] = pastedData.charAt(i)
        }
      }

      setCode(newCode)

      // Focus the appropriate input
      if (pastedData.length < 6) {
        inputRefs.current[pastedData.length]?.focus()
      }
    }
  }

  const handleResendCode = async () => {
    setCanResend(false)
    setCountdown(60)
    setError("")

    try {
      // Call API to resend code
      await axios.post("/users/auth/reset-password/", { 
        phone_number: phone 
      })
      
      toast.success("Reset code sent to your phone")
    } catch (error: any) {
      console.error(error)
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError("Failed to resend code. Please try again.")
      }
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const fullCode = code.join("")
    if (fullCode.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    try {
      setIsLoading(true)
      
      // We don't actually call the API here, just store the code and move to step 2
      localStorage.setItem("reset_verification_code", fullCode)
      
      // Move to password reset step
      setStep(2)
    } catch (error: any) {
      console.error(error)
      setError("Invalid code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newPassword) {
      setError("Please enter a new password")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setIsLoading(true)
      
      const storedCode = localStorage.getItem("reset_verification_code")
      
      // Call API to reset password
      await axios.post("/users/auth/reset-password/verify/", {
        phone_number: phone,
        verification_code: storedCode,
        new_password: newPassword,
        confirm_password: confirmPassword
      })
      
      // Clear stored data
      localStorage.removeItem("reset_phone_number")
      localStorage.removeItem("reset_verification_code")
      
      // Redirect to success page
      router.push("/auth/reset-success")
      
      toast.success("Password reset successful")
    } catch (error: any) {
      console.error(error)
      
      if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else if (error.response?.data?.verification_code) {
        setError(error.response.data.verification_code[0])
        // Go back to code entry if verification code is invalid
        setStep(1)
      } else if (error.response?.data?.new_password) {
        setError(error.response.data.new_password[0])
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
            <Link
              href={step === 1 ? "/auth/forgot-password" : "#"}
              onClick={step === 2 ? () => setStep(1) : undefined}
              className="inline-flex items-center text-sm text-gray-600 hover:text-[#f58220]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {step === 1 ? "Back" : "Back to code verification"}
            </Link>
          </div>

          <motion.div 
            key={`step-${step}`}
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
          >
            {step === 1 ? (
              <>
                <h1 className="text-3xl font-bold mb-2 text-[#0a2472]">Enter reset code</h1>
                <p className="text-gray-600 mb-8">
                  We've sent a 6-digit code to <span className="font-medium">{phone}</span>
                </p>

                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between gap-2">
                      {code.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleInputChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          className="w-12 h-12 text-center text-lg font-medium"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Didn't receive a code?</p>
                    {canResend ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleResendCode}
                        className="text-[#f58220] hover:text-[#f58220]/90 hover:bg-[#f58220]/10"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend Code
                      </Button>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Resend code in <span className="font-medium">{countdown}s</span>
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#f58220] hover:bg-[#f58220]/90"
                    disabled={isLoading || code.join("").length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2 text-[#0a2472]">Set new password</h1>
                <p className="text-gray-600 mb-8">
                  Create a new password for your account
                </p>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pr-10"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pr-10"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#f58220] hover:bg-[#f58220]/90"
                    disabled={isLoading || !newPassword || !confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-[#0a2472]/5 to-[#f58220]/10 relative overflow-hidden">
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
                x: [0, 10, 0],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 7,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute top-1/3 right-1/4 w-36 h-36 bg-[#0a2472]/10 rounded-full"
            />
            <motion.div
              animate={{
                x: [0, -10, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="absolute bottom-1/4 left-1/3 w-28 h-28 bg-[#f58220]/10 rounded-full"
            />

            {/* Main illustration */}
            <div className="relative z-10 bg-white rounded-2xl p-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-[#0a2472]/10 rounded-full flex items-center justify-center mb-4">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                      stroke="#0a2472"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Verify Your Identity</h3>
                <p className="text-gray-600">Enter the 6-digit code we sent to your phone</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#0a2472]/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#0a2472] font-medium">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone number provided</p>
                    <p className="text-xs text-gray-500">We've sent a verification code</p>
                  </div>
                </div>

                <div className="flex items-center p-3 bg-[#0a2472]/5 rounded-lg border border-[#0a2472]/20">
                  <div className="w-8 h-8 bg-[#0a2472]/20 rounded-full flex items-center justify-center mr-3">
                    <span className="text-[#0a2472] font-medium">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Enter verification code</p>
                    <p className="text-xs text-gray-500">Check your messages for the code</p>
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

              {/* Animated code verification */}
              <motion.div
                className="mt-6 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6].map((_, index) => (
                    <motion.div
                      key={index}
                      className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center"
                      animate={{
                        backgroundColor: [
                          "rgba(229, 231, 235, 1)",
                          "rgba(249, 115, 22, 0.2)",
                          "rgba(229, 231, 235, 1)",
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: index * 0.2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 3,
                      }}
                    >
                      <span className="text-xs font-medium text-gray-500">•</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
