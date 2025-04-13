"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "@/lib/axios"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token")
        if (!token) {
          setIsLoading(false)
          return
        }

        // Try to get user from localStorage first for immediate UI update
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }

        // Then fetch fresh user profile from API
        const response = await axios.get("/users/profile/")
        setUser(response.data)
        localStorage.setItem("user", JSON.stringify(response.data))
      } catch (error) {
        console.error("Authentication error:", error)
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
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
      
      // Extract tokens from the response based on the actual structure
      const { authentication, user_id, user_type } = response.data
      const { access_token, refresh_token } = authentication

      // Store tokens
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      
      // Store basic user info temporarily
      const tempUser = {
        id: user_id,
        user_type: user_type
      }
      localStorage.setItem("user", JSON.stringify(tempUser))

      // Fetch complete user profile
      const userResponse = await axios.get("/users/profile/")
      setUser(userResponse.data)
      
      // Update user data in localStorage with complete profile
      localStorage.setItem("user", JSON.stringify(userResponse.data))
      
      return Promise.resolve()
    } catch (error) {
      console.error("Login error:", error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up function
  const signUp = async (userData: any) => {
    try {
      // Transform the form data to match API expectations
      const apiData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        phone_number: userData.phone,
        password: userData.password,
        user_type: userData.userType,
        university_id: userData.university,
      }

      const response = await axios.post("/users/auth/register/", apiData)
      return userData.phone // Return phone number for OTP verification
    } catch (error) {
      console.error("Signup error:", error)
      return Promise.reject(error)
    }
  }

  // Verify OTP function
  const verifyOtp = async (otp: string, phone_number: string) => {
    try {
      const response = await axios.post("/users/auth/verify-phone/", {
        verification_code: otp,
        phone_number,
      })
      
      // Handle the response based on the actual structure
      if (response.data.authentication?.access_token) {
        localStorage.setItem("access_token", response.data.authentication.access_token)
        localStorage.setItem("refresh_token", response.data.authentication.refresh_token)
        
        // Store basic user info temporarily
        if (response.data.user_id) {
          const tempUser = {
            id: response.data.user_id,
            user_type: response.data.user_type || "PERSONAL"
          }
          localStorage.setItem("user", JSON.stringify(tempUser))
        }
        
        // Fetch complete user profile
        const userResponse = await axios.get("/users/profile/")
        setUser(userResponse.data)
        localStorage.setItem("user", JSON.stringify(userResponse.data))
      }
      
      return true
    } catch (error) {
      console.error("OTP verification error:", error)
      return false
    }
  }

  // Update university function
  const updateUniversity = async (universityId: number) => {
    try {
      const response = await axios.patch("/users/profile/", {
        university_id: universityId,
      })
      setUser(response.data)
      localStorage.setItem("user", JSON.stringify(response.data))
    } catch (error) {
      console.error("Update university error:", error)
      return Promise.reject(error)
    }
  }

  // Upgrade to merchant function
  const upgradeToMerchant = async (merchantName: string) => {
    try {
      const response = await axios.patch("/users/profile/", {
        user_type: "MERCHANT",
        merchant_name: merchantName,
      })
      setUser(response.data)
      localStorage.setItem("user", JSON.stringify(response.data))
    } catch (error) {
      console.error("Upgrade to merchant error:", error)
      return Promise.reject(error)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/auth/login")
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
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
