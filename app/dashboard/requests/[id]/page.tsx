"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  ArrowLeft,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  MessageSquare as MessageSquareIcon,
  SendHorizonal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from '@/providers/auth-provider'
import { useWebSocket } from '@/providers/websocket-provider'
import { useStartConversation } from '@/utils/start-conversation'

interface RequestDetails {
  id: string;
  title: string;
  description: string;
  category_name: string;
  status: string;
  created_at: string;
  view_count: number;
  offer_count: number;
  user_id: string;
  is_owner: boolean;
  offers?: Array<{
    id: string;
    merchant_name: string;
    merchant_id: string;
    price: number;
    description: string;
    status: string;
    created_at: string;
  }>;
  views?: Array<{
    id: string;
    merchant_name: string;
    merchant_id: string;
    viewed_at: string;
  }>;
}

interface ViewingMerchant {
  id: string;
  name: string;
}

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { requestWs, isRequestConnected } = useWebSocket()
  const { startChatWithMerchant, isLoading: isMessageLoading } = useStartConversation()
  
  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewingMerchants, setViewingMerchants] = useState<ViewingMerchant[]>([])
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [currentMerchant, setCurrentMerchant] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  
  // Format date helper function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  }
  
  // Handle WebSocket messages
  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      console.log("Request WebSocket received:", data)
      
      if (data.type === 'request_details' && data.request) {
        setRequestDetails(data.request)
        setIsLoading(false)
      }
      
      if (data.type === 'request_view_notification' && data.request_id === parseInt(params.id)) {
        console.log("View notification received:", data)
        // Add to viewing merchants
        const newViewer = {
          id: data.viewer_id,
          name: data.viewer_name
        }
        
        setViewingMerchants(prev => {
          // Check if merchant is already in the list
          if (prev.some(m => m.id === newViewer.id)) {
            return prev
          }
          return [...prev, newViewer]
        })
      }
      
      if (data.type === 'offer_notification' && data.offer && 
          data.offer.request_id === parseInt(params.id)) {
        console.log("New offer notification received:", data)
        // Refresh request details to get the new offer
        if (requestWs) {
          requestWs.send(JSON.stringify({
            type: 'get_request_details',
            request_id: params.id
          }))
        }
      }
      
      if (data.type === 'offer_status_update' && 
          data.request_id === parseInt(params.id)) {
        console.log("Offer status update received:", data)
        // Refresh request details to get the updated offer
        if (requestWs) {
          requestWs.send(JSON.stringify({
            type: 'get_request_details',
            request_id: params.id
          }))
        }
      }
      
      if (data.type === 'request_status_update' && 
          data.request_id === parseInt(params.id)) {
        console.log("Request status update received:", data)
        // Refresh request details to get the updated status
        if (requestWs) {
          requestWs.send(JSON.stringify({
            type: 'get_request_details',
            request_id: params.id
          }))
        }
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error)
    }
  }
  
  useEffect(() => {
    console.log(`Fetching request details for ID: ${params.id}`)
    
    if (isRequestConnected && requestWs) {
      // Get request details
      requestWs.send(JSON.stringify({
        type: 'get_request_details',
        request_id: params.id
      }))
      
      // Track view if user is not the owner
      if (user?.id && requestDetails?.user_id !== user.id) {
        requestWs.send(JSON.stringify({
          type: 'track_request_view',
          request_id: params.id
        }))
      }
      
      // Add event listener for WebSocket messages
      const socket = requestWs.getSocket()
      if (socket) {
        socket.addEventListener('message', handleWebSocketMessage)
      }
      
      // Cleanup function
      return () => {
        if (socket) {
          socket.removeEventListener('message', handleWebSocketMessage)
        }
      }
    }
  }, [isRequestConnected, params.id, requestWs, user?.id])
  
  // Handle accept offer
  const handleAcceptOffer = async (offerId: string) => {
    try {
      setSelectedOffer(offerId)
      
      if (requestWs) {
        requestWs.send(JSON.stringify({
          type: 'update_offer_status',
          offer_id: offerId,
          status: 'ACCEPTED'
        }))
        
        toast.success("Offer accepted successfully!")
      }
    } catch (error) {
      console.error("Error accepting offer:", error)
      toast.error("Failed to accept offer")
    } finally {
      setSelectedOffer(null)
    }
  }
  
  // Handle decline offer
  const handleDeclineOffer = async (offerId: string) => {
    try {
      if (requestWs) {
        requestWs.send(JSON.stringify({
          type: 'update_offer_status',
          offer_id: offerId,
          status: 'DECLINED'
        }))
        
        toast.success("Offer declined")
      }
    } catch (error) {
      console.error("Error declining offer:", error)
      toast.error("Failed to decline offer")
    }
  }
  
  // Handle cancel request
  const handleCancelRequest = async () => {
    try {
      if (requestWs) {
        requestWs.send(JSON.stringify({
          type: 'update_request_status',
          request_id: params.id,
          status: 'CANCELLED'
        }))
        
        toast.success("Request cancelled successfully")
        router.push('/dashboard/requests')
      }
    } catch (error) {
      console.error("Error cancelling request:", error)
      toast.error("Failed to cancel request")
    }
  }
  
  // Handle send message
  const handleSendMessage = async () => {
    if (!currentMerchant || !message.trim()) return
    
    try {
      await startChatWithMerchant(currentMerchant, message)
      setShowMessageModal(false)
      setMessage("")
      toast.success("Message sent successfully")
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-uniOrange" />
      </div>
    )
  }
  
  if (!requestDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-400">Request not found or you don't have permission to view it.</p>
        <Button 
          className="mt-4"
          onClick={() => router.push('/dashboard/requests')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Button>
      </div>
    )
  }
  
  const isOwner = requestDetails.is_owner

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/requests')}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Requests
        </Button>
        
        {isOwner && requestDetails.status === 'PENDING' && (
          <Button 
            variant="destructive"
            size="sm"
            onClick={handleCancelRequest}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancel Request
          </Button>
        )}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Request Status Banner */}
        <div className={`p-4 rounded-lg ${
          requestDetails.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
          requestDetails.status === 'ONGOING' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
          requestDetails.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
        }`}>
          <div className="flex items-center">
            <div className="mr-3">
              {requestDetails.status === 'PENDING' ? <Clock className="h-5 w-5" /> :
               requestDetails.status === 'ONGOING' ? <Loader2 className="h-5 w-5" /> :
               requestDetails.status === 'COMPLETED' ? <CheckCircle2 className="h-5 w-5" /> :
               <XCircle className="h-5 w-5" />}
            </div>
            <div>
              <p className="font-medium">
                Status: {requestDetails.status.charAt(0) + requestDetails.status.slice(1).toLowerCase()}
              </p>
              <p className="text-sm opacity-80">
                {requestDetails.status === 'PENDING' ? 'Waiting for offers from merchants' :
                 requestDetails.status === 'ONGOING' ? 'An offer has been accepted' :
                 requestDetails.status === 'COMPLETED' ? 'This request has been completed' :
                 'This request has been cancelled'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Request Details Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-2">{requestDetails.title}</h2>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="inline-flex items-center mr-4">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(requestDetails.created_at)}
            </span>
            <span className="inline-flex items-center mr-4">
              <Eye className="h-4 w-4 mr-1" />
              {requestDetails.view_count} views
            </span>
            {requestDetails.category_name && (
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                {requestDetails.category_name}
              </span>
            )}
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">
            {requestDetails.description}
          </p>
          
          {/* Active Viewers */}
          {viewingMerchants.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Eye className="h-4 w-4 mr-1 text-green-500" />
                Currently Viewing
              </h3>
              <div className="flex flex-wrap gap-2">
                {viewingMerchants.map(merchant => (
                  <div 
                    key={merchant.id}
                    className="flex items-center bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {merchant.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Offers Section */}
        {requestDetails.offers && requestDetails.offers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Offers ({requestDetails.offers.length})</h3>
            <div className="space-y-4">
              {requestDetails.offers.map((offer) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{offer.merchant_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(offer.created_at)}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-uniOrange">
                      ${offer.price}
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {offer.description}
                  </p>
                  
                  {/* Offer Status Badge */}
                  {offer.status !== 'PENDING' && (
                    <div className={`inline-block px-2 py-1 rounded text-xs mb-3 ${
                      offer.status === 'ACCEPTED' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}>
                      {offer.status === 'ACCEPTED' ? 'Accepted' : 'Declined'}
                    </div>
                  )}
                  
                  {isOwner && offer.status === 'PENDING' && requestDetails.status === 'PENDING' && (
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentMerchant(offer.merchant_id)
                          setShowMessageModal(true)
                        }}
                      >
                        <MessageSquareIcon className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        onClick={() => handleDeclineOffer(offer.id)}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Decline
                      </Button>
                      <Button 
                        className="bg-uniOrange hover:bg-uniOrange-600 text-white"
                        size="sm"
                        onClick={() => handleAcceptOffer(offer.id)}
                        disabled={selectedOffer === offer.id}
                      >
                        {selectedOffer === offer.id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        )}
                        Accept Offer
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Views Section */}
        {requestDetails.views && requestDetails.views.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Recent Views</h3>
            <div className="space-y-2">
              {requestDetails.views.map((view) => (
                <div key={view.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-2">
                      {view.merchant_name.charAt(0)}
                    </div>
                    <p>{view.merchant_name}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(view.viewed_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Merchant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700"
              placeholder="Type your message..."
              rows={4}
            />
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-uniBlue hover:bg-uniBlue-600 text-white"
                onClick={handleSendMessage}
                disabled={isMessageLoading}
              >
                {isMessageLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <SendHorizonal className="h-4 w-4 mr-2" />
                )}
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}