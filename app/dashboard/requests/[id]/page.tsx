"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import React from "react"
import { 
  ArrowLeft,
  Eye,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Store,
  BadgeCheck,
  Star,
  SendHorizonal,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRequest } from '@/providers/request-provider'

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params as any);
  const requestId = unwrappedParams.id;
  
  const router = useRouter()
  const { 
    viewRequest, 
    acceptOffer, 
    currentRequest,
    requestViews,
    pendingOffers,
    pendingRequests
  } = useRequest()
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    const loadRequest = async () => {
      if (!requestId) return;

      try {
        // Find request in pending requests
        const request = pendingRequests.find(r => r.id.toString() === requestId);
        
        if (request) {
          // View the request to track views
          viewRequest(requestId);
          setIsLoading(false);
        } else {
          console.log('Request not found in pending requests:', requestId);
          // Don't redirect immediately, show the not found state instead
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading request:', error);
        setIsLoading(false);
      }
    };

    loadRequest();
  }, [requestId, viewRequest, pendingRequests]);

  // Listen for new offers
  useEffect(() => {
    if (pendingOffers.length > 0) {
      // Update UI when new offers arrive
      const latestOffer = pendingOffers[pendingOffers.length - 1]
      toast(
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-uniOrange/10 flex items-center justify-center">
            💰
          </div>
          <div>
            <p className="font-medium">New Offer!</p>
            <p className="text-sm text-gray-600">
              {latestOffer.merchant.name} made an offer
            </p>
          </div>
        </div>
      )
    }
  }, [pendingOffers])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-uniOrange" />
          <p className="text-gray-500">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!currentRequest) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-500">Request not found</p>
          <Button 
            variant="ghost"
            onClick={() => router.push('/dashboard/requests')}
          >
            Back to Requests
          </Button>
        </div>
      </div>
    );
  }

  const handleAcceptOffer = async (offerId: string) => {
    setSelectedOffer(offerId)
    
    try {
      toast.loading("Processing your acceptance... ⚡️")
      acceptOffer(currentRequest.id, offerId)
      
      // Navigate after successful acceptance
      router.push(`/dashboard/requests/${currentRequest.id}/accepted`)
    } catch (error) {
      toast.error("Failed to accept offer")
      setSelectedOffer(null)
    }
  }

  const handleSendMessage = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Message sent! 📨")
      setShowMessageModal(false)
      setMessage("")
    } catch (error) {
      toast.error("Failed to send message")
    }
  }

  return (
    <div className="lg:container max-w-4xl py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Request Details 📋</h1>
      </div>

      <div className="grid gap-6">
        {currentRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{currentRequest.title}</h2>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDate(currentRequest.created_at)}
                  <span className="mx-2">•</span>
                  <Eye className="h-4 w-4 mr-1" />
                  {requestViews[currentRequest.id] || 0} views
                </div>
              </div>
              <span className="px-3 py-1 bg-uniOrange/10 text-uniOrange rounded-full text-sm font-medium">
                {currentRequest.category_name}
              </span>
            </div>

            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {currentRequest.description}
            </p>
          </motion.div>
        )}

        {/* Offers Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-uniOrange" />
            Offers ({pendingOffers.length})
          </h3>

          <AnimatePresence>
            {pendingOffers.map((offer) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
              >
                {/* Offer details */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <Image
                      src={offer.merchant.image}
                      alt={offer.merchant.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="ml-3">
                      <h4 className="font-semibold">{offer.merchant.name}</h4>
                      {offer.merchant.verified && (
                        <BadgeCheck className="h-4 w-4 ml-1 text-uniOrange" />
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-uniOrange">
                      ₦{offer.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(offer.createdAt)}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {offer.description}
                </p>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOffer(null)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button
                    className="bg-uniOrange hover:bg-uniOrange-600 text-white"
                    onClick={() => handleAcceptOffer(offer.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept Offer
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

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
              >
                <SendHorizonal className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 