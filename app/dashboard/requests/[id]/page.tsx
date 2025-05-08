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
import { useRequestDetails } from '@/hooks/useRequestDetails'

interface RequestDetails {
  id: string;
  title: string;
  description: string;
  category_name: string;
  status: string;
  created_at: string;
  view_count: number;
  offer_count: number;
  offers?: Array<{
    id: string;
    merchant_name: string;
    price: number;
    description: string;
    status: string;
    created_at: string;
  }>;
  views?: Array<{
    id: string;
    merchant_name: string;
    viewed_at: string;
  }>;
}

export default function RequestDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { 
    wsInstance, 
    isConnected,
    viewRequest,
    requestViews,
    pendingOffers,
    acceptOffer
  } = useRequest()

  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [message, setMessage] = useState("")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  useEffect(() => {
    if (!isConnected || !wsInstance) return;

    // Add handlers for this specific request
    const handleRequestDetails = (data: any) => {
      if (data.request) {
        setRequestDetails(data.request);
        setIsLoading(false);
      }
    };

    const handleError = (data: any) => {
      setError(data.message);
      setIsLoading(false);
    };

    // Add WebSocket handlers
    wsInstance.addMessageHandler('request_details', handleRequestDetails);
    wsInstance.addMessageHandler('error', handleError);

    // Request the details
    wsInstance.send('get_request_details', { request_id: params.id });

    // Track view
    viewRequest(params.id);

    return () => {
      wsInstance.removeMessageHandler('request_details');
      wsInstance.removeMessageHandler('error');
    };
  }, [isConnected, wsInstance, params.id, viewRequest]);

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-uniOrange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (!requestDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Request not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const handleAcceptOffer = async (offerId: string) => {
    setSelectedOffer(offerId)
    
    try {
      toast.loading("Processing your acceptance... ⚡️")
      acceptOffer(requestDetails.id, offerId)
      
      // Navigate after successful acceptance
      router.push(`/dashboard/requests/${requestDetails.id}/accepted`)
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
    <div className="container max-w-4xl py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Request Details</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-6"
      >
        {/* Request Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{requestDetails.title}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {requestDetails.description}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(requestDetails.created_at)}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {requestViews[params.id] || 0} views
            </div>
            <div className="flex items-center">
              <Store className="h-4 w-4 mr-1" />
              {requestDetails.offer_count} offers
            </div>
          </div>
        </div>

        {/* Offers Section */}
        {requestDetails.offers && requestDetails.offers.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Offers</h3>
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
                  <p className="text-gray-600 dark:text-gray-300">
                    {offer.description}
                  </p>
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
                  <p>{view.merchant_name}</p>
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