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
  Eye,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Users,
  Sparkles,
  PlusCircle,
  LayoutGrid
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useWebSocket } from '@/providers/websocket-provider'
import { Badge } from "@/components/ui/badge"

interface UserRequest {
  id: string;
  title: string;
  description: string;
  category_name: string;
  status: string;
  created_at: string;
  view_count: number;
  total_offers: number;
  pending_offers: number;
  university_name: string;
  can_cancel: boolean;
  can_accept_offers: boolean;
  accepted_offer?: {
    id: string;
    merchant_name: string;
    price: number;
    created_at: string;
  };
}

const statusEmojis: { [key: string]: string } = {
  'PENDING': '⏳',
  'ONGOING': '🔄',
  'COMPLETED': '✅',
  'CANCELLED': '❌'
}

export default function RequestHistoryPage() {
  const router = useRouter()
  const { requestWs, isRequestConnected } = useWebSocket()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)
  
  // Format date helper function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Status options for filtering
  const statusOptions = [
    { label: "All", value: null },
    { label: "Pending", value: "PENDING" },
    { label: "Ongoing", value: "ONGOING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" }
  ]
  
  useEffect(() => {
    if (!isRequestConnected || !requestWs) return
    
    const handleUserRequests = (data: any) => {
      if (data.type === 'user_requests') {
        setRequests(data.requests)
        setIsLoading(false)
      }
    }
    
    const handleRequestStatusUpdate = (data: any) => {
      if (data.type === 'request_status_update') {
        setRequests(prev => prev.map(request => {
          if (request.id === data.request_id) {
            return {
              ...request,
              status: data.status,
              can_cancel: data.status === 'PENDING',
              can_accept_offers: data.status === 'PENDING' && request.pending_offers > 0
            }
          }
          return request
        }))
      }
    }
    
    // Add message handlers
    requestWs.addMessageHandler('user_requests', handleUserRequests)
    requestWs.addMessageHandler('request_status_update', handleRequestStatusUpdate)
    
    // Request initial data
    requestWs.send('get_user_requests', {
      type: 'get_user_requests'
    })
    
    // Cleanup
    return () => {
      requestWs.removeMessageHandler('user_requests', handleUserRequests)
      requestWs.removeMessageHandler('request_status_update', handleRequestStatusUpdate)
    }
  }, [isRequestConnected, requestWs])
  
  // Handle cancel request
  const handleCancelRequest = async () => {
    if (!selectedRequest || !requestWs || !isRequestConnected) {
      toast.error("Not connected to server")
      return
    }
    
    try {
      requestWs.send('update_request_status', {
        type: 'update_request_status',
        request_id: selectedRequest,
        status: 'CANCELLED'
      })
      
      setShowCancelModal(false)
      setSelectedRequest(null)
      toast.success("Request cancelled successfully")
    } catch (error) {
      console.error("Error cancelling request:", error)
      toast.error("Failed to cancel request")
    }
  }
  
  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !selectedStatus || request.status === selectedStatus
    return matchesSearch && matchesStatus
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-uniOrange" />
      </div>
    )
  }
  
  return (
    <div className="container py-8">
      {/* Enhanced Header with Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-uniOrange to-orange-600 bg-clip-text text-transparent">
          My Requests 📦
        </h1>
        <p className="text-gray-500">Track and manage your marketplace requests</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Requests</p>
                <h3 className="text-2xl font-bold text-uniOrange">
                  {requests.filter(r => r.status === 'PENDING').length}
                </h3>
              </div>
              <div className="h-10 w-10 bg-uniOrange/10 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-uniOrange" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Offers</p>
                <h3 className="text-2xl font-bold text-uniBlue">
                  {requests.reduce((sum, r) => sum + r.total_offers, 0)}
                </h3>
              </div>
              <div className="h-10 w-10 bg-uniBlue/10 rounded-full flex items-center justify-center">
                <MessageSquarePlus className="h-5 w-5 text-uniBlue" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed Deals</p>
                <h3 className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'COMPLETED').length}
                </h3>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Enhanced Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search your requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
            {statusOptions.map((option) => (
              <Button
                key={option.value || 'all'}
                variant="outline"
                className={`whitespace-nowrap px-4 py-2 rounded-full transition-all ${
                  selectedStatus === option.value
                    ? "bg-uniOrange text-white border-transparent"
                    : "hover:border-uniOrange hover:text-uniOrange"
                }`}
                onClick={() => setSelectedStatus(option.value)}
              >
                {option.value ? statusEmojis[option.value] : '🔍'} {option.label}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Enhanced Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-uniOrange/50 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => router.push(`/dashboard/requests/${request.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold group-hover:text-uniOrange transition-colors">
                        {request.title}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                        request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        request.status === 'ONGOING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        request.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {statusEmojis[request.status]} {request.status}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      {request.university_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.can_cancel && (
                      <Button
                        variant="outline"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(request.id);
                          setShowCancelModal(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Request
                      </Button>
                    )}
                    <Button
                      className={`bg-uniOrange hover:bg-uniOrange-600 text-white ${
                        request.can_accept_offers ? 'animate-pulse' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/requests/${request.id}`);
                      }}
                    >
                      {request.can_accept_offers ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          View Offers ({request.pending_offers})
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          View Details
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {request.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(request.created_at)}
                    </div>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {request.view_count} views
                    </div>
                    <div className="flex items-center">
                      <MessageSquarePlus className="h-4 w-4 mr-1" />
                      {request.total_offers} offers
                    </div>
                  </div>
                  
                  {request.accepted_offer && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Accepted {request.accepted_offer.merchant_name}'s offer</span>
                      <span className="font-semibold">${request.accepted_offer.price}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No requests found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {searchQuery || selectedStatus
              ? "Try adjusting your search or filters to find what you're looking for."
              : "You haven't made any requests yet. Create a new request to get started!"}
          </p>
          <Button
            className="bg-uniOrange hover:bg-uniOrange-600 text-white"
            onClick={() => router.push('/dashboard/create-request')}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Your First Request
          </Button>
        </motion.div>
      )}

      {/* Enhanced Cancel Request Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <XCircle className="h-5 w-5" />
              Cancel Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                Are you sure you want to cancel this request? This action cannot be undone and all pending offers will be declined.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep It
              </Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleCancelRequest}
              >
                Yes, Cancel Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}