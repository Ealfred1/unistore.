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
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { useRequest } from '@/providers/request-provider'
import { formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Request {
  id: number;
  title: string;
  description: string;
  user_id: number;
  user_name: string;
  university_id: number;
  university_name: string;
  category_id: number | null;
  category_name: string | null;
  status: string;
  created_at: string;
  view_count?: number;
  offer_count?: number;
  offers?: Array<{
    id: number;
    merchant_id: number;
    merchant_name: string;
    price: number;
    description: string;
    status: string;
    created_at: string;
  }>;
}

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
      return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200', icon: MessageSquarePlus };
    case 'COMPLETED':
      return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', icon: CheckCircle2 };
    default:
      return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200', icon: X };
  }
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
        const requestId = parseInt(params.id, 10);
        const request = pendingRequests.find(r => r.id === requestId) as Request | undefined;
        
        if (request) {
          console.log('Found and initializing request:', request);
          
          // Make sure all required fields are present
          const requestDetails: RequestDetails = {
            id: request.id,
            title: request.title,
            description: request.description,
            user_id: request.user_id,
            user_name: request.user_name,
            university_id: request.university_id,
            university_name: request.university_name,
            category_id: request.category_id,
            category_name: request.category_name,
            budget_min: null, // These will be updated when we get full details
            budget_max: null,
            status: request.status,
            created_at: request.created_at,
            view_count: request.view_count || 0,
            offer_count: request.offer_count || 0,
            is_owner: false,
            is_merchant: true,
            offers: request.offers || []
          };
          
          setRequestDetails(requestDetails);
          setIsLoading(false);
          detailsLoaded.current = true;

          // Send view request through WebSocket when connected
          if (!viewSent.current) {
            console.log('Sending view request for:', requestId);
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
      if (data.request_id.toString() === params.id) {
        console.log('Received view update:', data);
        setRequestDetails(prev => prev ? {
          ...prev,
          view_count: data.view_count
        } : null);
      }
    };

    const handleNewOffer = (data: any) => {
      if (data.request_id.toString() === params.id) {
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Request Details</h1>
        </div>
        <Badge variant="outline" className={getStatusConfig(requestDetails?.status || 'PENDING').color}>
          {requestDetails?.status || 'PENDING'}
        </Badge>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{requestDetails?.title}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  <span>{requestDetails?.view_count || 0} views</span>
                  <span className="text-gray-300">•</span>
                  <Clock className="h-4 w-4" />
                  <span>{formatDistanceToNow(new Date(requestDetails?.created_at || ''), { addSuffix: true })}</span>
                </div>
              </div>
              <Badge className="bg-uniOrange/10 text-uniOrange hover:bg-uniOrange/20">
                {requestDetails?.category_name || "Uncategorized"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {requestDetails?.description}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Student</p>
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(requestDetails?.user_name || '')}&background=random`} />
                    <AvatarFallback>{getInitials(requestDetails?.user_name || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{requestDetails?.user_name}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Budget Range</p>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-uniOrange">
                    {requestDetails?.budget_min ? `₦${requestDetails.budget_min.toLocaleString()}` : 'Open'} 
                    {' - '} 
                    {requestDetails?.budget_max ? `₦${requestDetails.budget_max.toLocaleString()}` : 'Open'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              className="w-full bg-uniOrange hover:bg-uniOrange/90 text-white"
              onClick={() => setShowOfferModal(true)}
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              Make an Offer
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Make Offer Dialog - Enhanced UI */}
      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-uniOrange">Make an Offer</span>
              <Badge variant="outline" className="bg-uniOrange/10 text-uniOrange">
                {requestDetails?.category_name}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleMakeOffer} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Price</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">₦</span>
                </div>
                <input
                  type="number"
                  required
                  value={offerForm.price}
                  onChange={(e) => setOfferForm(prev => ({ ...prev, price: e.target.value }))}
                  className="pl-8 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                required
                value={offerForm.description}
                onChange={(e) => setOfferForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent"
                placeholder="Describe your offer in detail..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOfferModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-uniOrange hover:bg-uniOrange/90 text-white min-w-[100px]"
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