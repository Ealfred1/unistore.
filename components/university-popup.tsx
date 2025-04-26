"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useUniversities } from "@/providers/university-provider"

interface UniversityPopupProps {
  onClose: () => void
  onSelect: (universityId: number, universityName: string, universityImage?: string) => void
}

export function UniversityPopup({ onClose, onSelect }: UniversityPopupProps) {
  const { universities, isLoading } = useUniversities()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredUniversities, setFilteredUniversities] = useState(universities)

  // Filter universities based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUniversities(universities)
    } else {
      const filtered = universities.filter(
        (uni) =>
          uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          uni.abbreviation.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredUniversities(filtered)
    }
  }, [searchQuery, universities])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Select Your University</h2>
          </div>

          <div className="p-4">
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

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex items-center p-3 rounded-xl border border-gray-200">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredUniversities.length > 0 ? (
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {filteredUniversities.map((university) => (
                      <div
                        key={university.id}
                        onClick={() => onSelect(university.id, university.name, university.image)}
                        className="flex items-center p-3 rounded-xl border cursor-pointer transition-all hover:border-[#f58220] hover:bg-[#f58220]/5"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-4 flex items-center justify-center">
                          {university.image ? (
                            <img
                              src={university.image || "/placeholder.svg"}
                              alt={university.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-bold">
                              {university.abbreviation ||
                                university.name
                                  .split(" ")
                                  .map((word) => word[0])
                                  .join("")
                                  .substring(0, 2)
                                  .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{university.name}</h4>
                          <p className="text-sm text-gray-500 truncate">{university.abbreviation}</p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center">
                            <Check className="h-4 w-4 text-white opacity-0 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No universities found matching "{searchQuery}"</p>
                    <Button onClick={() => setSearchQuery("")} variant="outline" className="mt-4">
                      Clear Search
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 border-t flex justify-between">
            {/* <Button variant="outline" onClick={onClose}>
              Skip for Now
            </Button> */}
            <Button className="bg-[#f58220] w-full hover:bg-[#f58220]/90" onClick={onClose}>
              Continue
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
