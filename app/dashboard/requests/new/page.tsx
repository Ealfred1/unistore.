"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Loader2, 
  SendHorizonal,
  BookOpen,
  GraduationCap,
  Tags,
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRequest } from "@/providers/request-provider"
import { useProducts } from "@/providers/product-provider"

export default function NewRequestPage() {
  const router = useRouter()
  const { createRequest } = useRequest()
  const { categories, isLoading: categoriesLoading } = useProducts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const [requestForm, setRequestForm] = useState({
    title: "",
    description: "",
    category: "",
  })

  // Scroll handlers for category carousel
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300 // Adjust this value as needed
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Show loading toast
      toast.loading("Creating your request... 🚀")
      
      // Create request and wait for response
      const createdRequest = await createRequest({
        title: requestForm.title,
        description: requestForm.description,
        category_id: requestForm.category
      })
      
      // Show success toast
      toast.success("Request created successfully! 🎉")
      
      // Navigate to request details with correct ID
      router.push(`/dashboard/requests/${createdRequest.id}`)
    } catch (error) {
      console.error('Error creating request:', error)
      toast.error("Failed to create request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="lg:container max-w-3xl py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Request 🌟</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-10 w-10 bg-uniOrange/10 rounded-full flex items-center justify-center">
              <MessageSquarePlus className="h-5 w-5 text-uniOrange" />
            </div>
            <div>
              <h2 className="font-semibold">What are you looking for? 🤔</h2>
              <p className="text-sm text-gray-500">
                Create a request and let merchants help you find what you need!
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base font-medium flex items-center">
                <BookOpen className="h-4 w-4 mr-2 text-uniOrange" />
                Request Title*
              </Label>
              <input
                type="text"
                id="title"
                value={requestForm.title}
                onChange={(e) => setRequestForm(prev => ({ ...prev, title: e.target.value }))}
                required
                className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                placeholder="e.g., Looking for Chemistry 101 Textbook"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium flex items-center">
                <Tags className="h-4 w-4 mr-2 text-uniOrange" />
                Description*
              </Label>
              <textarea
                id="description"
                rows={4}
                value={requestForm.description}
                onChange={(e) => setRequestForm(prev => ({ ...prev, description: e.target.value }))}
                required
                className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                placeholder="Describe what you're looking for in detail..."
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-base font-medium flex items-center mb-4">
                <GraduationCap className="h-4 w-4 mr-2 text-uniOrange" />
                Category*
              </Label>
              
              <div className="relative">
                {/* Left scroll button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm"
                  onClick={() => handleScroll('left')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Scrollable categories container */}
                <div 
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto scrollbar-hide gap-3 px-8 pb-2 -mx-2"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {categoriesLoading ? (
                    // Loading skeletons
                    Array.from({ length: 5 }).map((_, i) => (
                      <div 
                        key={i}
                        className="flex-shrink-0 w-[200px] h-[100px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
                      />
                    ))
                  ) : (
                    // Actual categories
                    categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setRequestForm(prev => ({ ...prev, category: category.id }))}
                        className={`flex-shrink-0 w-[200px] p-4 rounded-lg border-2 transition-all ${
                          requestForm.category === category.id
                            ? "border-uniOrange bg-uniOrange/5"
                            : "border-gray-200 dark:border-gray-700 hover:border-uniOrange/50"
                        }`}
                      >
                        <div className="text-2xl mb-2">{category.icon}</div>
                        <div className="text-sm font-medium">{category.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {category.product_count} items available
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Right scroll button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm"
                  onClick={() => handleScroll('right')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-uniOrange hover:bg-uniOrange-600 text-white h-12 text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Request...
                  </>
                ) : (
                  <>
                    <SendHorizonal className="mr-2 h-5 w-5" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}