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
  Building
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRequest } from '@/providers/request-provider'
import { formatDistanceToNow } from 'date-fns'

interface RequestDetails {
  id: number;
  title: string;
  description: string;
  user_id: number;
  user_name: string;
  university_id: number;
  university_name: string;
  category_id: number | null;
  category_name: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
  view_count: number;
  offer_count: number;
  is_owner: boolean;
  is_merchant: boolean;
  offers?: Array<{
    id: number;
    merchant_id: number;
    merchant_name: string;
    price: number;
    description: string;
    status: string;
    created_at: string;
  }>;
  views?: Array<{
    id: number;
    merchant_id: number;
    merchant_name: string;
    viewed_at: string;
  }>;
}

export default function MerchantRequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { 
    pendingRequests,
    viewRequest,
    makeOffer,
    wsInstance,
    isConnected
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
  const detailsLoaded = useRef(false)

  // Initialize request details and send view
  useEffect(() => {
    const initializeRequest = async () => {
      if (!isConnected || !wsInstance || detailsLoaded.current) return;

      try {
        // Convert params.id to number for comparison
        const requestId = parseInt(params.id);
        const request = pendingRequests.find(r => r.id === requestId);
        
        if (request) {
          console.log('Found and initializing request:', request);
          // Make sure all required fields are present
          const requestDetails: RequestDetails = {
            ...request,
            view_count: request.view_count || 0,
            offer_count: request.offer_count || 0,
            is_owner: false,
            is_merchant: true,
            offers: request.offers || [],
          };
          
          setRequestDetails(requestDetails);
          setIsLoading(false);
          detailsLoaded.current = true;

          // Send view request immediately when connected
          if (!viewSent.current) {
            console.log('Sending initial view request for:', requestId);
            viewRequest(requestId.toString());
            viewSent.current = true;
          }
        } else {
          console.log('Request not found in pending requests');
          setError("Request not found");
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing request:', err);
        setError("Failed to load request details");
        setIsLoading(false);
      }
    };

    initializeRequest();
  }, [isConnected, wsInstance, params.id, pendingRequests, viewRequest]);

  // Handle WebSocket events for views and offers
  useEffect(() => {
    if (!wsInstance || !requestDetails) return;

    const handleRequestView = (data: any) => {
      if (data.request_id === params.id) {
        console.log('Received view update:', data);
        setRequestDetails(prev => prev ? {
          ...prev,
          view_count: data.view_count
        } : null);
      }
    };

    const handleNewOffer = (data: any) => {
      if (data.request_id === params.id) {
        console.log('Received new offer:', data);
        setRequestDetails(prev => prev ? {
          ...prev,
          offers: [...(prev.offers || []), data.offer]
        } : null);

        toast.success("New offer received! 💰");
      }
    };

    // Add event listeners
    wsInstance.addMessageHandler('request_view_notification', handleRequestView);
    wsInstance.addMessageHandler('offer_notification', handleNewOffer);

    return () => {
      wsInstance.removeMessageHandler('request_view_notification', handleRequestView);
      wsInstance.removeMessageHandler('offer_notification', handleNewOffer);
    };
  }, [wsInstance, params.id, requestDetails]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!wsInstance || !isConnected) {
        throw new Error('WebSocket not connected');
      }

      console.log('Making offer for request:', params.id);
      
      makeOffer(params.id, {
        offer_data: {
          price: parseFloat(offerForm.price),
          description: offerForm.description
        }
      });
      
      toast.success("Offer sent successfully! 🎉");
      setShowOfferModal(false);
      setOfferForm({ price: "", description: "" });
      
      // Navigate back after success
      setTimeout(() => {
        router.push('/dashboard/merchant/requests');
      }, 1500);
    } catch (error) {
      console.error("Error making offer:", error);
      toast.error("Failed to send offer");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {requestDetails.category_name || "Uncategorized"}
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
          </div>
          
          {/* Budget information if available */}
          {(requestDetails.budget_min || requestDetails.budget_max) && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <p className="text-sm font-medium">Budget Range:</p>
              <p className="text-uniOrange font-semibold">
                {requestDetails.budget_min ? `₦${requestDetails.budget_min.toLocaleString()}` : 'Open'} 
                {' - '} 
                {requestDetails.budget_max ? `₦${requestDetails.budget_max.toLocaleString()}` : 'Open'}
              </p>
            </div>
          )}
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