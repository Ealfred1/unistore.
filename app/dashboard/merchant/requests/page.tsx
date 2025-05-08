"use client"

import { useState, useEffect, useCallback } from "react"
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
import { useRequest } from "@/providers/request-provider"
import { useRouter } from "next/navigation"

export default function MerchantRequestsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filteredRequests, setFilteredRequests] = useState<any[]>([])
  
  // Get real-time requests from the request provider
  const { pendingRequests, isConnected } = useRequest()
  const router = useRouter()

  const categories = [
    "📚 Textbooks",
    "💻 Electronics",
    "✏️ Study Materials",
    "🎨 Art Supplies",
    "🔬 Lab Equipment"
  ]

  // Map category names to emoji prefixes
  const categoryEmojis: {[key: string]: string} = {
    "Accessories": "👜",
    "Textbooks": "📚",
    "Electronics": "💻",
    "Study Materials": "✏️",
    "Art Supplies": "🎨",
    "Lab Equipment": "🔬",
    // Add more mappings as needed
  }

  // Format request data to match the UI structure
  const formatRequestData = useCallback((request: any) => {
    return {
      id: request.id,
      title: request.title,
      description: request.description,
      category: `${categoryEmojis[request.category_name] || '🔍'} ${request.category_name}`,
      createdAt: request.created_at,
      urgency: "Medium", // Default value as it's not in the API data
      views: 0, // Default value
      offers: 0, // Default value
      user: {
        name: request.user_name,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(request.user_name)}`,
        university: request.university_name,
        yearLevel: "Student" // Default value as it's not in the API data
      }
    }
  }, [])

  useEffect(() => {
    // Set loading state based on connection and data availability
    setIsLoading(!isConnected || pendingRequests.length === 0)
  }, [isConnected, pendingRequests])

  useEffect(() => {
    // Format and filter requests when pendingRequests changes
    let formattedRequests = pendingRequests.map(formatRequestData)
    
    // Apply search
    if (searchQuery) {
      formattedRequests = formattedRequests.filter(request => 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply category filter
    if (selectedCategory) {
      formattedRequests = formattedRequests.filter(request => request.category === selectedCategory)
    }
    
    setFilteredRequests(formattedRequests)
  }, [pendingRequests, searchQuery, selectedCategory, formatRequestData])

  // Replace handleMakeOffer with handleViewRequest
  const handleViewRequest = (requestId: string) => {
    router.push(`/dashboard/merchant/requests/${requestId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="ml-3">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2"></div>
              </div>
            </div>
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
          <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )

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
                <h3 className="text-2xl font-bold text-uniOrange">{pendingRequests.length}</h3>
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

      {/* Connection Status */}
      {!isConnected && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center">
            <Loader2 className="h-5 w-5 text-yellow-500 animate-spin mr-2" />
            <p className="text-yellow-700 dark:text-yellow-400">Connecting to server...</p>
          </div>
        </div>
      )}

      {/* Enhanced Request Cards */}
      {isLoading ? (
        renderSkeleton()
      ) : filteredRequests.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="group bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 hover:border-uniOrange/50 transition-all cursor-pointer"
                onClick={() => handleViewRequest(request.id)}
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
                      <p className="text-sm text-gray-500">{request.user.university}</p>
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
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      handleViewRequest(request.id);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No requests found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery || selectedCategory 
              ? "Try adjusting your search or filters to find what you're looking for."
              : "There are no active student requests at the moment. Check back later!"}
          </p>
        </div>
      )}
    </div>
  )
} 