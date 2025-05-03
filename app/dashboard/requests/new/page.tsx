"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Loader2, 
  SendHorizonal,
  BookOpen,
  GraduationCap,
  Tags,
  MessageSquarePlus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function NewRequestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [requestForm, setRequestForm] = useState({
    title: "",
    description: "",
    category: "",
  })

  const dummyCategories = [
    { id: "1", name: "📚 Textbooks", icon: "📚" },
    { id: "2", name: "💻 Electronics", icon: "💻" },
    { id: "3", name: "✏️ Study Materials", icon: "✏️" },
    { id: "4", name: "🎨 Art Supplies", icon: "🎨" },
    { id: "5", name: "🔬 Lab Equipment", icon: "🔬" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success toast
      toast.success("Request created successfully! 🎉")
      
      // Redirect to request details
      router.push(`/dashboard/requests/123`) // Replace with actual request ID
    } catch (error) {
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
              <Label htmlFor="category" className="text-base font-medium flex items-center">
                <GraduationCap className="h-4 w-4 mr-2 text-uniOrange" />
                Category*
              </Label>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {dummyCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setRequestForm(prev => ({ ...prev, category: category.id }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      requestForm.category === category.id
                        ? "border-uniOrange bg-uniOrange/5"
                        : "border-gray-200 dark:border-gray-700 hover:border-uniOrange/50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-sm font-medium">{category.name}</div>
                  </button>
                ))}
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