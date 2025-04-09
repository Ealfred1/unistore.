"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define user type
interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  university?: string
  avatar?: string
  userType: "personal" | "merchant"
  createdAt: Date
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: { phone: string; password: string }) => Promise<void>
  signUp: (userData: any) => Promise<void>
  logout: () => void
  verifyOtp: (otp: string) => Promise<boolean>
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
        // In a real app, you would check for a token in localStorage or cookies
        // and validate it with your backend
        const storedUser = localStorage.getItem("unistore_user")

        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (credentials: { phone: string; password: string }) => {
    setIsLoading(true)

    try {
      // In a real app, you would make an API call to your backend
      // This is a mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data
      const mockUser: User = {
        id: "user_123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: credentials.phone,
        university: "University of Lagos",
        avatar: "/placeholder.svg?height=200&width=200",
        userType: "personal",
        createdAt: new Date(),
      }

      setUser(mockUser)
      localStorage.setItem("unistore_user", JSON.stringify(mockUser))
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
      // In a real app, you would make an API call to your backend
      // This is a mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock user creation
      const mockUser: User = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        university: userData.university,
        userType: userData.userType as "personal" | "merchant",
        createdAt: new Date(),
      }

      // In a real app, we would not automatically log in the user after signup
      // They would need to verify their email/phone first
      console.log("User registered:", mockUser)

      // For demo purposes, we're not setting the user here
      // as they would typically need to verify their account first
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Verify OTP function
  const verifyOtp = async (otp: string) => {
    setIsLoading(true)

    try {
      // In a real app, you would make an API call to your backend
      // This is a mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock OTP verification (accept any 6-digit code)
      const isValid = /^\d{6}$/.test(otp)

      return isValid
    } catch (error) {
      console.error("OTP verification error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("unistore_user")
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
