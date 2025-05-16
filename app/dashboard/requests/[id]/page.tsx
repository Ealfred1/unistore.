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
  SendHorizonal,
  Phone,
  Mail,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useAuth } from '@/providers/auth-provider'
import { useWebSocket } from '@/providers/websocket-provider'
import { useStartConversation } from '@/utils/start-conversation'
import { useRequest } from '@/providers/request-provider'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
    merchant_email?: string;
    merchant_phone?: string;
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

interface User {
  id: string;
  user_type: string;
  // ... other user properties
}

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { requestWs, isRequestConnected } = useWebSocket()
  const { viewRequest } = useRequest()
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
  
  // Fetch request details
  useEffect(() => {
    console.log(`Fetching request details for ID: ${params.id}`)
    
    if (isRequestConnected && requestWs) {
      // Set up message handler for request detailsnnhhhh
      const handleRequestDetails = (data: any) => {
        if (data.type === 'request_details' && data.request) {
          console.log("Received request details:", data.request)
          setRequestDetails(data.request)
          setIsLoading(false)
        }
      }
      
      // Set up message handler for view notifications
      const handleViewNotification = (data: any) => {
        if (data.type === 'request_view_notification' && data.request_id === parseInt(params.id)) {
          console.log("View notification received:", data)
          // Add to viewing merchants
          const newViewer = {
            id: data.viewer_id,
            name: data.viewer_name
          }
          
          setViewingMerchants(prev => {
            if (!prev.some(m => m.id === newViewer.id)) {
              return [...prev, newViewer]
            }
            return prev
          })
          
          // Update request details with new view count
          setRequestDetails(prev => {
            if (prev) {
              return {
                ...prev,
                view_count: data.view_count
              }
            }
            return prev
          })
        }
      }
      
      // Set up message handler for new offers
      const handleNewOffer = (data: any) => {
        if (data.type === 'new_offer' && data.request_id === parseInt(params.id)) {
          console.log("New offer received:", data)
          // Update request details with new offer
          setRequestDetails(prev => {
            if (prev) {
              const newOffer = {
                id: data.offer.id,
                merchant_id: data.merchant_id,
                merchant_name: data.merchant_name,
                price: data.offer.price,
                description: data.offer.description,
                status: data.offer.status,
                created_at: data.offer.created_at
              }
              
              const offers = prev.offers ? [...prev.offers] : []
              if (!offers.some(o => o.id === newOffer.id)) {
                offers.unshift(newOffer)
              }
              
              return {
                ...prev,
                offer_count: prev.offer_count + 1,
                offers
              }
            }
            return prev
          })
        }
      }
      
      // Set up message handler for offer status updates
      const handleOfferStatusUpdate = async (data: any) => {
        if (data.type === 'offer_status_update' && data.request_id === parseInt(params.id)) {
          if (data.status === 'DECLINED') {
            // Remove declined offer immediately
            setRequestDetails(prev => {
              if (prev && prev.offers) {
                return {
                  ...prev,
                  offers: prev.offers.filter(offer => offer.id !== data.offer_id)
                }
              }
              return prev
            });
          } else if (data.status === 'ACCEPTED') {
            // Update offer status and add merchant contact info
          setRequestDetails(prev => {
            if (prev && prev.offers) {
              const updatedOffers = prev.offers.map(offer => {
                if (offer.id === data.offer_id) {
                  return {
                    ...offer,
                      status: 'ACCEPTED',
                      merchant_email: data.merchant_email,
                      merchant_phone: data.merchant_phone
                    };
                  }
                  // Decline all other offers
                  return {
                    ...offer,
                    status: 'DECLINED'
                  };
                });
              
              return {
                ...prev,
                offers: updatedOffers,
                  status: 'ONGOING'
                };
            }
              return prev;
            });
          }
          
          // Clear loading state after 3 seconds
          setTimeout(() => {
            setSelectedOffer(null);
          }, 3000);
        }
      };
      
      // Set up message handler for request status updates
      const handleRequestStatusUpdate = (data: any) => {
        if (data.type === 'request_status_update' && data.request_id === parseInt(params.id)) {
          setRequestDetails(prev => {
            if (prev) {
              return {
                ...prev,
                status: data.status
              };
            }
            return prev;
          });

          // If request is cancelled, show modal
          if (data.status === 'CANCELLED') {
            toast.error("This request has been cancelled by the student");
            router.push('/dashboard/requests');
        }
      }
      };
      
      // Add message handlers
      requestWs.addMessageHandler('request_details', handleRequestDetails)
      requestWs.addMessageHandler('request_view_notification', handleViewNotification)
      requestWs.addMessageHandler('new_offer', handleNewOffer)
      requestWs.addMessageHandler('offer_status_update', handleOfferStatusUpdate)
      requestWs.addMessageHandler('request_status_update', handleRequestStatusUpdate)
      
      // Request details
      try {
        requestWs.send('get_request_details', {
          type: 'get_request_details',
          request_id: params.id
        })
        
        // Track view if user is a merchant
        if (user?.user_type === 'MERCHANT') {
          viewRequest(params.id)
        }
      } catch (error) {
        console.error("Error sending WebSocket message:", error)
        toast.error("Failed to fetch request details")
        setIsLoading(false)
      }
      
      // Cleanup
      return () => {
        requestWs.removeMessageHandler('request_details', handleRequestDetails)
        requestWs.removeMessageHandler('request_view_notification', handleViewNotification)
        requestWs.removeMessageHandler('new_offer', handleNewOffer)
        requestWs.removeMessageHandler('offer_status_update', handleOfferStatusUpdate)
        requestWs.removeMessageHandler('request_status_update', handleRequestStatusUpdate)
      }
    } else {
      // Fallback to API if WebSocket is not connected
      const fetchDetails = async () => {
        try {
          const response = await fetch(`/api/requests/${params.id}`)
          if (!response.ok) throw new Error("Failed to fetch request details")
          
          const data = await response.json()
          setRequestDetails(data)
        } catch (error) {
          console.error("Error fetching request details:", error)
          toast.error("Failed to fetch request details")
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchDetails()
    }
  }, [params.id, isRequestConnected, requestWs, user?.user_type, viewRequest, router])
  
  // Handle accept offer
  const handleAcceptOffer = async (offerId: string) => {
    if (!requestWs || !isRequestConnected) {
      toast.error("Not connected to server")
      return
    }
    
    setSelectedOffer(offerId)
    
    try {
      // Start a 3-second timer
      setTimeout(() => {
        setSelectedOffer(null)
      }, 3000)

      requestWs.send('update_offer_status', {
        type: 'update_offer_status',
        offer_id: offerId,
        status: 'ACCEPTED'
      })
    } catch (error) {
      console.error("Error accepting offer:", error)
      toast.error("Failed to accept offer")
      setSelectedOffer(null)
    }
  }
  
  // Handle decline offer
  const handleDeclineOffer = async (offerId: string) => {
    if (!requestWs || !isRequestConnected) {
      toast.error("Not connected to server")
      return
    }
    
    try {
      // Immediately remove the offer from UI
      setRequestDetails(prev => {
        if (prev && prev.offers) {
          return {
            ...prev,
            offers: prev.offers.filter(offer => offer.id !== offerId)
          }
        }
        return prev
      })

      // Send decline status to server
      requestWs.send('update_offer_status', {
        type: 'update_offer_status',
        offer_id: offerId,
        status: 'DECLINED'
      })

      toast.success("Offer declined")
    } catch (error) {
      console.error("Error declining offer:", error)
      toast.error("Failed to decline offer")
    }
  }
  
  // Handle cancel request
  const handleCancelRequest = async () => {
    if (!requestWs || !isRequestConnected || !requestDetails) {
      toast.error("Not connected to server")
      return
    }
    
    try {
      requestWs.send('update_request_status', {
        type: 'update_request_status',
        request_id: requestDetails.id,
        status: 'CANCELLED'
      })
      
      toast.success("Request cancelled successfully")
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
  const isPending = requestDetails.status === 'PENDING'
  const isOngoing = requestDetails.status === 'ONGOING'
  const isCompleted = requestDetails.status === 'COMPLETED'
  const isCancelled = requestDetails.status === 'CANCELLED'
  
  // Add helper functions
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200', icon: Clock };
      case 'ONGOING':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', icon: MessageSquareIcon };
      case 'COMPLETED':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', icon: CheckCircle2 };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200', icon: XCircle };
    }
  }

  // Add copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy text");
    }
  };
  
  return (
    <div className="container max-w-5xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/requests')}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Button>
        </div>
        <Badge variant="outline" className={getStatusConfig(requestDetails?.status || 'PENDING').color}>
          {requestDetails?.status || 'PENDING'}
        </Badge>
      </div>
      
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Request Header */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{requestDetails?.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Posted {formatDate(requestDetails?.created_at || '')}</span>
                  <span className="text-gray-300">•</span>
                  <Eye className="h-4 w-4" />
                  <span>{requestDetails?.view_count} views</span>
                  {requestDetails?.category_name && (
                    <>
                      <span className="text-gray-300">•</span>
                      <Badge variant="outline" className="bg-uniOrange/10 text-uniOrange">
                        {requestDetails.category_name}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              {requestDetails?.is_owner && requestDetails?.status === 'PENDING' && (
                <Button 
                  variant="outline" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={handleCancelRequest}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Request
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {requestDetails?.description}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Offers Section */}
        {requestDetails?.offers && requestDetails.offers.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Offers
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                  {requestDetails.offers.length}
                </Badge>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requestDetails.offers.map((offer) => (
                  <motion.div 
                    key={offer.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-uniOrange/50 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(offer.merchant_name)}&background=random`} />
                            <AvatarFallback>{getInitials(offer.merchant_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{offer.merchant_name}</p>
                            <p className="text-sm text-gray-500">{formatDate(offer.created_at)}</p>
                          </div>
                        </div>
                        <div className="pl-12">
                          <p className="text-gray-700 dark:text-gray-300">{offer.description}</p>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-uniOrange">
                        ₦{offer.price.toLocaleString()}
                      </div>
                    </div>
                    
                    {offer.status === 'ACCEPTED' && (
                      <div className="mt-4 space-y-3 pl-12">
                        <TooltipProvider>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span>{offer.merchant_phone || 'No phone number'}</span>
                            </div>
                            {offer.merchant_phone && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(offer.merchant_phone)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy phone number</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>{offer.merchant_email}</span>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(offer.merchant_email)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy email</TooltipContent>
                            </Tooltip>
                          </div>
                          
                          <div className="flex gap-2">
                            {offer.merchant_phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => window.location.href = `tel:${offer.merchant_phone}`}
                              >
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                              </Button>
                            )}
                            
                            <Button 
                              className="flex-1 bg-uniOrange hover:bg-uniOrange/90 text-white"
                              size="sm"
                              onClick={() => {
                                setCurrentMerchant(offer.merchant_id)
                                setShowMessageModal(true)
                              }}
                            >
                              <MessageSquareIcon className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        </TooltipProvider>
                      </div>
                    )}
                    
                    {requestDetails.is_owner && offer.status === 'PENDING' && (
                      <div className="mt-4 flex items-center space-x-2 pl-12">
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
                          className="bg-uniOrange hover:bg-uniOrange/90 text-white"
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
            </CardContent>
          </Card>
        )}

        {/* Views Section */}
        {requestDetails?.views && requestDetails.views.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Recent Views
                <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                  {requestDetails.views.length}
                </Badge>
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requestDetails.views.map((view) => (
                  <div key={view.id} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(view.merchant_name)}&background=random`} />
                        <AvatarFallback>{getInitials(view.merchant_name)}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{view.merchant_name}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate(view.viewed_at)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Merchant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent"
              placeholder="Type your message..."
              rows={4}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-uniOrange hover:bg-uniOrange/90 text-white min-w-[100px]"
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