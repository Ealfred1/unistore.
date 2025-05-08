"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
  ArrowLeft,
  Eye,
  Clock,
  MessageSquarePlus,
  Loader2,
  SendHorizonal,
  X,
  User,
  Building,
  Tag
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRequest } from '@/providers/request-provider'

interface RequestDetails {
  id: string;
  title: string;
  description: string;
  category_name: string;
  status: string;
  created_at: string;
  view_count: number;
  offer_count: number;
  user_name: string;
  university_name: string;
}

export default function MerchantRequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { 
    wsInstance, 
    isConnected,
    viewRequest,
    makeOffer
  } = useRequest()

  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [offerForm, setOfferForm] = useState({
    price: "",
    description: ""
  })

  // Track if we've sent the view request
  const viewSent = useRef(false)

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
        
        // Send view request only once when details are loaded
        if (!viewSent.current) {
          viewRequest(params.id);
          viewSent.current = true;
        }
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

    return () => {
      wsInstance.removeMessageHandler('request_details');
      wsInstance.removeMessageHandler('error');
    };
  }, [isConnected, wsInstance, params.id, viewRequest]);

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Use the makeOffer function from the provider
      await makeOffer(params.id, {
        offer_data: {
          price: parseFloat(offerForm.price),
          description: offerForm.description
        }
      })
      
      toast.success("Offer sent successfully! 🎉")
      setShowOfferModal(false)
      setOfferForm({ price: "", description: "" })
      
      // Navigate back to requests page after successful offer
      router.push('/dashboard/merchant/requests')
    } catch (error) {
      toast.error("Failed to send offer")
      console.error("Error making offer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">{requestDetails.title}</h2>
            <span className="px-3 py-1 bg-uniOrange/10 text-uniOrange rounded-full text-sm">
              {requestDetails.category_name}
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {requestDetails.description}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              <span>{requestDetails.user_name}</span>
            </div>
            <div className="flex items-center text-sm">
              <Building className="h-4 w-4 mr-2 text-gray-500" />
              <span>{requestDetails.university_name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {formatDate(requestDetails.created_at)}
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {requestDetails.view_count || 0} views
            </div>
            <div className="flex items-center">
              <MessageSquarePlus className="h-4 w-4 mr-1" />
              {requestDetails.offer_count || 0} offers
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button 
            className="bg-uniOrange hover:bg-uniOrange-600 text-white"
            onClick={() => setShowOfferModal(true)}
          >
            <MessageSquarePlus className="h-4 w-4 mr-2" />
            Make an Offer
          </Button>
        </div>
      </motion.div>

      {/* Make Offer Dialog */}
      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
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
                onClick={() => setShowOfferModal(false)}
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