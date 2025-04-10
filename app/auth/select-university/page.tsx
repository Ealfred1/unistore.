"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Search, Check } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import Image from "next/image"

// Mock university data
const universities = [
  {
    id: 1,
    name: "University of Lagos",
    logo: "/placeholder.svg?height=80&width=80&text=UNILAG",
    location: "Lagos, Nigeria",
    popular: true,
  },
  {
    id: 2,
    name: "University of Ibadan",
    logo: "/placeholder.svg?height=80&width=80&text=UI",
    location: "Ibadan, Nigeria",
    popular: true,
  },
  {
    id: 3,
    name: "Obafemi Awolowo University",
    logo: "/placeholder.svg?height=80&width=80&text=OAU",
    location: "Ile-Ife, Nigeria",
    popular: true,
  },
  {
    id: 4,
    name: "University of Nigeria",
    logo: "/placeholder.svg?height=80&width=80&text=UNN",
    location: "Nsukka, Nigeria",
    popular: false,
  },
  {
    id: 5,
    name: "Ahmadu Bello University",
    logo: "/placeholder.svg?height=80&width=80&text=ABU",
    location: "Zaria, Nigeria",
    popular: false,
  },
  {
    id: 6,
    name: "University of Benin",
    logo: "/placeholder.svg?height=80&width=80&text=UNIBEN",
    location: "Benin City, Nigeria",
    popular: false,
  },
  {
    id: 7,
    name: "University of Port Harcourt",
    logo: "/placeholder.svg?height=80&width=80&text=UNIPORT",
    location: "Port Harcourt, Nigeria",
    popular: false,
  },
  {
    id: 8,
    name: "Federal University of Technology, Akure",
    logo: "/placeholder.svg?height=80&width=80&text=FUTA",
    location: "Akure, Nigeria",
    popular: false,
  },
]

export default function SelectUniversityPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUniversity, setSelectedUniversity] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Filter universities based on search query
  const filteredUniversities = universities.filter(
    (uni) =>
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Group universities by popularity
  const popularUniversities = filteredUniversities.filter((uni) => uni.popular)
  const otherUniversities = filteredUniversities.filter((uni) => !uni.popular)

  // Handle university selection
  const handleSelectUniversity = (id: number) => {
    setSelectedUniversity(id)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUniversity) {
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, you would call an API to update the user's university
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Redirect to welcome page
      router.push("/auth/welcome")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="w-full max-w-2xl mx-auto p-8">
        <div className="mb-8">
          <Logo className="text-2xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          <Link href="/auth/verify-otp" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
          </Link>

          <h1 className="text-2xl font-bold mb-2">Select Your University</h1>
          <p className="text-gray-600 mb-6">
            Choose your university to connect with fellow students and access campus-specific marketplace.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for your university..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
              />
            </div>

            <div className="space-y-6">
              {popularUniversities.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Popular Universities</h3>
                  <div className="space-y-2">
                    {popularUniversities.map((uni) => (
                      <UniversityCard
                        key={uni.id}
                        university={uni}
                        isSelected={selectedUniversity === uni.id}
                        onSelect={() => handleSelectUniversity(uni.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherUniversities.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Other Universities</h3>
                  <div className="space-y-2">
                    {otherUniversities.map((uni) => (
                      <UniversityCard
                        key={uni.id}
                        university={uni}
                        isSelected={selectedUniversity === uni.id}
                        onSelect={() => handleSelectUniversity(uni.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredUniversities.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No universities found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <motion.button
                type="submit"
                disabled={isSubmitting || !selectedUniversity}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-[#f58220] text-white font-medium rounded-xl hover:bg-[#f58220]/90 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </div>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

interface UniversityCardProps {
  university: {
    id: number
    name: string
    logo: string
    location: string
  }
  isSelected: boolean
  onSelect: () => void
}

function UniversityCard({ university, isSelected, onSelect }: UniversityCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
        isSelected ? "border-[#f58220] bg-[#f58220]/5" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-4">
        <Image
          src={university.logo || "/placeholder.svg"}
          alt={university.name}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{university.name}</h4>
        <p className="text-sm text-gray-500 truncate">{university.location}</p>
      </div>
      {isSelected && (
        <div className="flex-shrink-0 ml-4">
          <div className="w-6 h-6 rounded-full bg-[#f58220] flex items-center justify-center">
            <Check className="h-4 w-4 text-white" />
          </div>
        </div>
      )}
    </div>
  )
}
