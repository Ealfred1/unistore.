"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "@/lib/axios"

// Define university type
interface University {
  id: number
  name: string
  abbreviation: string
  description: string
  school_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Define university context type
interface UniversityContextType {
  universities: University[]
  isLoading: boolean
  fetchUniversities: () => Promise<void>
  getUniversityById: (id: number) => University | undefined
}

// Create university context
const UniversityContext = createContext<UniversityContextType | undefined>(undefined)

// University provider props
interface UniversityProviderProps {
  children: ReactNode
}

export function UniversityProvider({ children }: UniversityProviderProps) {
  const [universities, setUniversities] = useState<University[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch universities
  const fetchUniversities = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get("/universities/")
      setUniversities(response.data.results || response.data)
    } catch (error) {
      console.error("Error fetching universities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get university by ID
  const getUniversityById = (id: number) => {
    return universities.find((university) => university.id === id)
  }

  // Load initial data
  useEffect(() => {
    fetchUniversities()
  }, [])

  return (
    <UniversityContext.Provider
      value={{
        universities,
        isLoading,
        fetchUniversities,
        getUniversityById,
      }}
    >
      {children}
    </UniversityContext.Provider>
  )
}

// Custom hook to use university context
export function useUniversities() {
  const context = useContext(UniversityContext)

  if (context === undefined) {
    throw new Error("useUniversities must be used within a UniversityProvider")
  }

  return context
}
