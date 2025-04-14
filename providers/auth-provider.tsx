"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "@/lib/axios"
import { useRouter } from "next/navigation"
import Cookies from 'js-cookie'

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
  requestPasswordReset: (phone_number: string) => Promise<void>
  verifyPasswordReset: (data: {
    phone_number: string;
    verification_code: string;
    new_password: string;
    confirm_password: string;
  }) => Promise<void>
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

      // Store tokens in localStorage
      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      
      // Also store in cookies for middleware access
      Cookies.set("access_token", access_token, { expires: 7 })
      
      // Store basic user info temporarily
      const tempUser = {
        id: user_id,
        user_type: user_type
      }
      localStorage.setItem("user", JSON.stringify(tempUser))
      Cookies.set("user", JSON.stringify(tempUser), { expires: 7 })

      // Fetch complete user profile
      const userResponse = await axios.get("/users/profile/")
      setUser(userResponse.data)
      
      // Update user data in localStorage and cookies with complete profile
      localStorage.setItem("user", JSON.stringify(userResponse.data))
      Cookies.set("user", JSON.stringify(userResponse.data), { expires: 7 })
      
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
        const accessToken = response.data.authentication.access_token
        const refreshToken = response.data.authentication.refresh_token
        
        localStorage.setItem("access_token", accessToken)
        localStorage.setItem("refresh_token", refreshToken)
        Cookies.set("access_token", accessToken, { expires: 7 })
        
        // Store basic user info temporarily
        if (response.data.user_id) {
          const tempUser = {
            id: response.data.user_id,
            user_type: response.data.user_type || "PERSONAL"
          }
          localStorage.setItem("user", JSON.stringify(tempUser))
          Cookies.set("user", JSON.stringify(tempUser), { expires: 7 })
        }
        
        // Fetch complete user profile
        const userResponse = await axios.get("/users/profile/")
        setUser(userResponse.data)
        localStorage.setItem("user", JSON.stringify(userResponse.data))
        Cookies.set("user", JSON.stringify(userResponse.data), { expires: 7 })
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
      const response = await axios.post("/users/profile/upgrade-to-merchant/", {
        merchant_name: merchantName,
      });
      
      const updatedUser = {
        ...user,
        user_type: "MERCHANT",
        merchant_name: merchantName
      };
      
      // Update user data with merchant information
      setUser(updatedUser);
      
      // Update user data in localStorage and cookies
      localStorage.setItem("user", JSON.stringify(updatedUser));
      Cookies.set("user", JSON.stringify(updatedUser), { expires: 7 });
      
      return Promise.resolve(response.data);
    } catch (error) {
      console.error("Upgrade to merchant error:", error);
      return Promise.reject(error);
    }
  }

  // Request password reset function
  const requestPasswordReset = async (phone_number: string) => {
    try {
      await axios.post("/users/auth/reset-password/", { phone_number })
    } catch (error) {
      console.error("Password reset request error:", error)
      return Promise.reject(error)
    }
  }

  // Verify password reset function
  const verifyPasswordReset = async (data: {
    phone_number: string;
    verification_code: string;
    new_password: string;
    confirm_password: string;
  }) => {
    try {
      await axios.post("/users/auth/reset-password/verify/", data)
    } catch (error) {
      console.error("Password reset verification error:", error)
      return Promise.reject(error)
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    
    // Also clear cookies
    Cookies.remove("access_token")
    Cookies.remove("user")
    
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
        requestPasswordReset,
        verifyPasswordReset,
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
