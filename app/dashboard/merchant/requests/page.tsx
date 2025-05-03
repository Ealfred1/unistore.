"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search,
  Store,
  Clock,
  MessageSquarePlus,
  Filter,
  Loader2,
  SendHorizonal,
  X,
  BookOpen,
  Users,
  Eye,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

// Enhanced dummy data with more details
const requests = [
  {
    id: "1",
    title: "Looking for Chemistry 101 Textbook",
    description: "Need the latest edition of Chemistry 101 by John Smith. Preferably in good condition.",
    category: "📚 Textbooks",
    createdAt: "2024-03-15T10:00:00Z",
    urgency: "High",
    views: 24,
    offers: 3,
    user: {
      name: "John Doe",
      image: "https://ui-avatars.com/api/?name=John+Doe",
      university: "University of Lagos",
      yearLevel: "2nd Year"
    }
  },
  {
    id: "2",
    title: "Need Scientific Calculator",
    description: "Looking for a Texas Instruments TI-84 Plus calculator for my engineering classes.",
    category: "💻 Electronics",
    createdAt: "2024-03-15T09:30:00Z",
    user: {
      name: "Jane Smith",
      image: "https://ui-avatars.com/api/?name=Jane+Smith",
      university: "University of Lagos"
    }
  },
  // Add more dummy requests...
]

export default function MerchantRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [offerForm, setOfferForm] = useState({
    price: "",
    description: ""
  })
  const [isLoading, setIsLoading] = useState(true)
  const [filteredRequests, setFilteredRequests] = useState(requests)

  const categories = [
    "📚 Textbooks",
    "💻 Electronics",
    "✏️ Study Materials",
    "🎨 Art Supplies",
    "🔬 Lab Equipment"
  ]

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    let filtered = requests
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(request => 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(request => request.category === selectedCategory)
    }
    
    setFilteredRequests(filtered)
  }, [searchQuery, selectedCategory])

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Offer sent successfully! 🎉")
      setSelectedRequest(null)
      setOfferForm({ price: "", description: "" })
    } catch (error) {
      toast.error("Failed to send offer")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="lg:container py-8">
      {/* Enhanced Header with Stats */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Student Requests 🎓</h1>
        <p className="text-gray-500">Help students find what they need!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Requests</p>
                <h3 className="text-2xl font-bold text-uniOrange">24</h3>
              </div>
              <div className="h-10 w-10 bg-uniOrange/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-uniOrange" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <h3 className="text-2xl font-bold text-uniBlue">156</h3>
              </div>
              <div className="h-10 w-10 bg-uniBlue/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-uniBlue" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Your Offers</p>
                <h3 className="text-2xl font-bold text-green-600">12</h3>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <MessageSquarePlus className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className={`whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-uniOrange/10 text-uniOrange border-uniOrange"
                    : "border-gray-200 dark:border-gray-700"
                }`}
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Request Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:border-uniOrange/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={request.user.image}
                      alt={request.user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">{request.user.name}</h3>
                    <p className="text-sm text-gray-500">{request.user.yearLevel}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-uniOrange/10 text-uniOrange rounded-full text-sm">
                  {request.category}
                </span>
              </div>

              <h2 className="text-lg font-semibold mb-2 group-hover:text-uniOrange transition-colors">
                {request.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {request.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {request.views} views
                </div>
                <div className="flex items-center">
                  <MessageSquarePlus className="h-4 w-4 mr-1" />
                  {request.offers} offers
                </div>
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" />
                  {request.urgency} priority
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(request.createdAt)}
                </div>
                <Button
                  className="bg-uniOrange hover:bg-uniOrange-600 text-white"
                  onClick={() => setSelectedRequest(request)}
                >
                  <MessageSquarePlus className="h-4 w-4 mr-2" />
                  Make Offer
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Make Offer Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make an Offer 💫</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleMakeOffer} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your Price</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₦</span>
                </div>
                <input
                  type="number"
                  required
                  value={offerForm.price}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, price: e.target.value }))}
                  className="pl-8 w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                required
                value={offerForm.description}
                onChange={(e) => setOfferForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent"
                placeholder="Describe your offer and any additional details..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedRequest(null)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-uniOrange hover:bg-uniOrange-600 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <SendHorizonal className="h-4 w-4 mr-2" />
                    Send Offer
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 