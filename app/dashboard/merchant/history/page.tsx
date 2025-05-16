"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  MessageSquarePlus,
  Clock,
  CheckCircle,
  XCircle,
  Store,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRequest } from "@/providers/request-provider"
import { useRouter } from "next/navigation"
import { useStartConversation } from "@/utils/start-conversation"
import { toast } from "sonner"

export default function MerchantHistoryPage() {
  const [acceptedRequests, setAcceptedRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  const { wsInstance } = useRequest()
  const router = useRouter()
  const { startChatWithMerchant } = useStartConversation()

  // Fetch merchant's accepted requests on mount
  const fetchAcceptedRequests = async () => {
    try {
      const response = await fetch('/api/merchant/accepted-requests')
      if (!response.ok) throw new Error('Failed to fetch requests')
      const data = await response.json()
      setAcceptedRequests(data.requests)
    } catch (error) {
      toast.error("Failed to load request history")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAcceptedRequests()
  }, [])

  // Listen for WebSocket updates
  useEffect(() => {
    if (!wsInstance) return

    const handleOfferStatusUpdate = async (data: any) => {
      if (data.type === 'offer_status_update') {
        if (data.status === 'ACCEPTED') {
          // Fetch fresh data when an offer is accepted
          await fetchAcceptedRequests()
        } else if (['DECLINED', 'CANCELLED'].includes(data.status)) {
          // Remove the request if offer was declined/cancelled
          setAcceptedRequests(prev => prev.filter(req => req.id !== data.request_id))
        }
      }
    }

    wsInstance.addMessageHandler('offer_status_update', handleOfferStatusUpdate)
    return () => wsInstance.removeMessageHandler('offer_status_update', handleOfferStatusUpdate)
  }, [wsInstance])

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter requests based on search
  const filteredRequests = acceptedRequests.filter(request =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle starting chat with student
  const handleStartChat = async (userId: string) => {
    try {
      await startChatWithMerchant(userId, "Hi! I'm contacting you regarding our accepted offer.")
    } catch (error) {
      toast.error("Failed to start conversation")
    }
  }

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="lg:container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="lg:container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Request History 📚</h1>
        <p className="text-gray-500">View your accepted requests and ongoing deals</p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent"
          />
        </div>
      </div>

      {/* Request Cards */}
      {filteredRequests.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={request.user.image || `/placeholder.svg?text=${request.user.name[0]}`}
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
                <span className="px-3 py-1 bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400 rounded-full text-sm flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accepted
                </span>
              </div>

              <h2 className="text-lg font-semibold mb-2">{request.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                {request.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Store className="h-4 w-4 mr-1" />
                  {request.category}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(request.created_at)}
                </div>
              </div>

              <Button
                className="w-full bg-uniOrange hover:bg-uniOrange-600 text-white"
                onClick={() => handleStartChat(request.user.id)}
              >
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                Message Student
              </Button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No accepted requests yet</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchQuery 
              ? "No requests match your search criteria."
              : "When students accept your offers, they'll appear here."}
          </p>
        </div>
      )}
    </div>
  )
} 