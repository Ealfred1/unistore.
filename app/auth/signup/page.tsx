"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Eye, EyeOff, ArrowRight, UserPlus, Facebook, Twitter, Mail, Check, Building } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { UniversityPopup } from "@/components/university-popup"

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+234",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    university: "",
    universityName: "", // Added to store the university name for display
    universityImage: "", // Added to store the university image
    userType: "PERSONAL",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showUniversityPopup, setShowUniversityPopup] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    
    if (name === "phone") {
      // Don't allow changing +234
      if (!value.startsWith("+234")) {
        return
      }
      
      // Remove any non-digit characters after +234
      const digits = value.slice(4).replace(/\D/g, "")
      
      // Ensure first digit after +234 isn't 0
      if (digits.length > 0 && digits[0] === "0") {
        return
      }
      
      // Limit to 10 digits after +234
      const truncated = digits.slice(0, 10)
      
      setFormData(prev => ({
        ...prev,
        phone: `+234${truncated}`
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (step === 1) {
      // Validate first step
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast.error("Please fill in all required fields")
        return
      }

      if (!formData.password || formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long")
        return
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Please make sure your passwords match")
        return
      }

      if (!formData.agreeTerms) {
        toast.error("You must agree to the terms of service")
        return
      }

      setStep(2)
      return
    }

    if (step === 2) {
      // Validate second step
      if (!formData.university || !formData.userType) {
        toast.error("Please select your university and account type")
        return
      }

      setIsSubmitting(true)

      try {
        const phoneNumber = await signUp(formData)

        // Store phone number in local storage
        localStorage.setItem("verification_phone_number", phoneNumber)

        // Redirect to OTP verification page
        router.push(`/auth/verify-otp`)
      } catch (error: any) {
        console.error(error)
        
        // Handle specific error cases
        const errorData = error.response?.data
        
        if (errorData) {
          // Handle phone number already exists error
          if (errorData.phone_number && errorData.phone_number.includes("user with this phone number already exists")) {
            toast.error("This phone number is already registered. Please use a different number.")
            setStep(1) // Take user back to first step to change phone number
            return
          }
          
          // Handle email already exists error
          if (errorData.email && errorData.email.includes("user with this email address already exists")) {
            toast.error("This email is already registered. Please use a different email address.")
            setStep(1) // Take user back to first step to change email
            return
          }
          
          // Handle other field-specific errors
          const errorFields = Object.keys(errorData)
          if (errorFields.length > 0) {
            // Display the first error message we find
            const firstErrorField = errorFields[0]
            const errorMessage = Array.isArray(errorData[firstErrorField]) 
              ? errorData[firstErrorField][0] 
              : errorData[firstErrorField]
            
            toast.error(`${firstErrorField.replace('_', ' ')}: ${errorMessage}`)
            
            // If the error is related to fields in step 1, go back to step 1
            if (['email', 'phone_number', 'first_name', 'last_name', 'password'].includes(firstErrorField)) {
              setStep(1)
            }
            return
          }
        }
        
        // Generic error fallback
        toast.error(error.response?.data?.detail || "An error occurred during registration")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Handle university selection from popup
  const handleSelectUniversity = (universityId: number, universityName: string, universityImage?: string) => {
    setFormData((prev) => ({
      ...prev,
      university: universityId.toString(),
      universityName: universityName,
      universityImage: universityImage || "",
    }))
    setShowUniversityPopup(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left side - Image and animated background */}
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
              Create your account and start buying, selling, and connecting with fellow students.
            </p>

            <motion.div
              className="mt-12 w-full max-w-md mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-medium">Why Join Unistore?</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-[#f58220]" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Connect with fellow students</p>
                      <p className="text-sm text-gray-500">Build your network within your university</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-[#f58220]" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Buy and sell easily</p>
                      <p className="text-sm text-gray-500">Find what you need or sell what you don't</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-[#f58220]" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">Secure transactions</p>
                      <p className="text-sm text-gray-500">Safe and reliable platform for all your needs</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="h-5 w-5 text-[#f58220]" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">University-specific marketplace</p>
                      <p className="text-sm text-gray-500">Tailored to your campus community</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Logo className="text-2xl" />
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold mb-2">Create your account</h1>
            <p className="text-gray-600 mb-8">Join the community of university students</p>

            {/* Step indicator */}
            <div className="mb-8">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-[#f58220] text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  1
                </div>
                <div className={`flex-1 h-1 mx-2 ${step >= 2 ? "bg-[#f58220]" : "bg-gray-200"}`}></div>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-[#f58220] text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  2
                </div>
                <div className={`flex-1 h-1 mx-2 ${step >= 3 ? "bg-[#f58220]" : "bg-gray-200"}`}></div>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? "bg-[#f58220] text-white" : "bg-gray-200 text-gray-500"}`}
                >
                  3
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">Personal Info</span>
                <span className="text-xs text-gray-500">University & Preferences</span>
                <span className="text-xs text-gray-500">Verify OTP</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent transition-all"
                        placeholder="John"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent transition-all"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent transition-all"
                      placeholder="john.doe@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent transition-all"
                      placeholder="+234 XXX XXX XXXX"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent transition-all"
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
                    <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#f58220] focus:ring-[#f58220] border-gray-300 rounded"
                      required
                    />
                    <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                      I agree to Unistore{" "}
                      <Link href="/terms" className="text-[#f58220] hover:text-[#f58220]/80">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-[#f58220] hover:text-[#f58220]/80">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Your University</label>

                    {formData.university ? (
                      <div className="flex items-center justify-between p-3 rounded-xl border border-[#f58220] bg-[#f58220]/5">
                        <div className="flex items-center">
                          {formData.universityImage ? (
                            <img
                              src={formData.universityImage || "/placeholder.svg"}
                              alt={formData.universityName}
                              className="w-12 h-12 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                              <span className="text-lg font-bold">
                                {formData.universityName
                                  .split(" ")
                                  .map((word) => word[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{formData.universityName}</p>
                          </div>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => setShowUniversityPopup(true)}>
                          Change
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        onClick={() => setShowUniversityPopup(true)}
                        className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center"
                      >
                        <Building className="mr-2 h-5 w-5 text-gray-500" />
                        Click to Select University
                      </Button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">I want to use Unistore as:</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          formData.userType === "PERSONAL"
                            ? "border-[#f58220] bg-[#f58220]/5"
                            : "border-gray-300 hover:border-[#f58220]/50"
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, userType: "PERSONAL" }))}
                      >
                        <div className="flex items-center mb-2">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              formData.userType === "PERSONAL" ? "border-[#f58220]" : "border-gray-300"
                            }`}
                          >
                            {formData.userType === "PERSONAL" && (
                              <div className="w-3 h-3 rounded-full bg-[#f58220]"></div>
                            )}
                          </div>
                          <span className="ml-2 font-medium">Personal User</span>
                        </div>
                        <p className="text-sm text-gray-500">I want to buy products and connect with other students</p>
                      </div>

                      <div
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          formData.userType === "MERCHANT"
                            ? "border-[#f58220] bg-[#f58220]/5"
                            : "border-gray-300 hover:border-[#f58220]/50"
                        }`}
                        onClick={() => setFormData((prev) => ({ ...prev, userType: "MERCHANT" }))}
                      >
                        <div className="flex items-center mb-2">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              formData.userType === "MERCHANT" ? "border-[#f58220]" : "border-gray-300"
                            }`}
                          >
                            {formData.userType === "MERCHANT" && (
                              <div className="w-3 h-3 rounded-full bg-[#f58220]"></div>
                            )}
                          </div>
                          <span className="ml-2 font-medium">Merchant</span>
                        </div>
                        <p className="text-sm text-gray-500">I want to sell products to other students</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:ring-offset-2"
                    >
                      Back
                    </button>

                    <motion.button
                      type="submit"
                      disabled={isSubmitting || !formData.university || !formData.userType}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-4 bg-[#f58220] text-white font-medium rounded-xl hover:bg-[#f58220]/90 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          Creating...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <UserPlus className="h-5 w-5 mr-2" />
                          Create Account
                        </div>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 py-3 px-4 bg-[#f58220] text-white font-medium rounded-xl hover:bg-[#f58220]/90 transition-all flex items-center justify-center"
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
              )}
            </form>

            {step === 1 && (
              <>
                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-50 text-gray-500">Or sign up with</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <Facebook className="h-5 w-5 text-[#1877F2]" />
                    </button>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                    </button>
                    <button
                      type="button"
                      className="w-full inline-flex justify-center py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <Mail className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-[#f58220] hover:text-[#f58220]/80 inline-flex items-center"
                  >
                    Sign in <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* University Selection Popup */}
      <AnimatePresence>
        {showUniversityPopup && (
          <UniversityPopup
            onClose={() => setShowUniversityPopup(false)}
            onSelect={(universityId, universityName, universityImage) =>
              handleSelectUniversity(universityId, universityName, universityImage)
            }
          />
        )}
      </AnimatePresence>
    </div>
  )
}
