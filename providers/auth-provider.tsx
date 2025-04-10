"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "@/lib/axios"

// Define user type
interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  university?: {
    id: number
    name: string
  }
  profile_picture?: string
  user_type: "PERSONAL" | "MERCHANT"
  merchant_name?: string
  created_at: string
  phone_verified: boolean
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { phone_number: string; password: string }) => Promise<void>
  signUp: (userData: any) => Promise<string>
  logout: () => void
  verifyOtp: (otp: string, phone_number: string) => Promise<boolean>
  updateUniversity: (universityId: number) => Promise<void>
  upgradeToMerchant: (merchantName: string) => Promise<void>
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth provider props
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          setIsLoading(false)
          return
        }

        // Fetch user profile
        const response = await axios.get("/users/profile/")
        setUser(response.data)
      } catch (error) {
        console.error("Authentication error:", error)
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (credentials: { phone_number: string; password: string }) => {
    setIsLoading(true)

    try {
      const response = await axios.post("/users/auth/login/", credentials)
      const { access_token, refresh_token } = response.data

      // Store tokens
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)

      // Fetch user profile
      const userResponse = await axios.get("/users/profile/")
      setUser(userResponse.data)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up function
  const signUp = async (userData: any) => {
    setIsLoading(true)

    try {
      const response = await axios.post("/users/auth/register/", {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone_number: userData.phone,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        user_type: userData.userType.toUpperCase(),
      })

      // Return the phone number for OTP verification
      return userData.phone
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP function
  const verifyOtp = async (otp: string, phone_number: string) => {
    setIsLoading(true)

    try {
      const response = await axios.post("/users/auth/verify-phone/", {
        phone_number,
        verification_code: otp,
      })

      const { access_token, refresh_token } = response.data

      // Store tokens
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)

      // Fetch user profile
      const userResponse = await axios.get("/users/profile/")
      setUser(userResponse.data)

      return true
    } catch (error) {
      console.error("OTP verification error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Update university function
  const updateUniversity = async (universityId: number) => {
    try {
      await axios.post("/users/profile/update-university/", {
        university_id: universityId,
      })

      // Update user state with new university
      const userResponse = await axios.get("/users/profile/")
      setUser(userResponse.data)
    } catch (error) {
      console.error("University update error:", error)
      throw error
    }
  }

  // Upgrade to merchant function
  const upgradeToMerchant = async (merchantName: string) => {
    try {
      await axios.post("/users/profile/upgrade-to-merchant/", {
        merchant_name: merchantName,
      })

      // Update user state with new merchant status
      const userResponse = await axios.get("/users/profile/")
      setUser(userResponse.data)
    } catch (error) {
      console.error("Merchant upgrade error:", error)
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshToken) {
        await axios.post("/users/auth/logout/", { refresh_token: refreshToken })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signUp,
        logout,
        verifyOtp,
        updateUniversity,
        upgradeToMerchant,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
