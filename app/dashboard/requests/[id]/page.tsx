"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  SendHorizonal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

// Dummy data
const requestData = {
  id: "123",
  title: "Looking for Chemistry 101 Textbook",
  description: "Need the latest edition of Chemistry 101 by John Smith. Preferably in good condition.",
  category: "📚 Textbooks",
  status: "active",
  createdAt: "2024-03-15T10:00:00Z",
  views: 24,
  offers: [
    {
      id: "1",
      merchant: {
        name: "Campus Bookstore",
        rating: 4.8,
        verified: true,
        image: "https://ui-avatars.com/api/?name=Campus+Bookstore"
      },
      price: 15000,
      description: "We have a new copy of Chemistry 101, latest edition available.",
      createdAt: "2024-03-15T11:30:00Z"
    },
    {
      id: "2",
      merchant: {
        name: "Student Exchange",
        rating: 4.5,
        verified: false,
        image: "https://ui-avatars.com/api/?name=Student+Exchange"
      },
      price: 12000,
      description: "Used copy in excellent condition, all pages intact.",
      createdAt: "2024-03-15T12:15:00Z"
    }
  ]
}

export default function RequestDetailsPage() {
  const router = useRouter()
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

  const handleAcceptOffer = async (offerId: string) => {
    setSelectedOffer(offerId)
    
    try {
      // Show loading toast
      toast.loading("Processing your acceptance... ⚡️")
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Show success toast
      toast.success("Offer accepted successfully! 🎉")
      
      // Navigate to accepted page
      router.push(`/dashboard/requests/${requestData.id}/accepted`)
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
        {/* Request Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold">{requestData.title}</h2>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {formatDate(requestData.createdAt)}
                <span className="mx-2">•</span>
                <Eye className="h-4 w-4 mr-1" />
                {requestData.views} views
              </div>
            </div>
            <span className="px-3 py-1 bg-uniOrange/10 text-uniOrange rounded-full text-sm font-medium">
              {requestData.category}
            </span>
          </div>

          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {requestData.description}
          </p>
        </motion.div>

        {/* Offers Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MessageSquare className="h-5 w-5 mr-2 text-uniOrange" />
            Offers ({requestData.offers.length})
          </h3>

          <AnimatePresence>
            {requestData.offers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-950 rounded-xl border ${
                  selectedOffer === offer.id
                    ? "border-uniOrange"
                    : "border-gray-200 dark:border-gray-800"
                } shadow-sm p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={offer.merchant.image}
                        alt={offer.merchant.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <h4 className="font-semibold">{offer.merchant.name}</h4>
                        {offer.merchant.verified && (
                          <BadgeCheck className="h-4 w-4 ml-1 text-uniOrange" />
                        )}
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                        {offer.merchant.rating}
                      </div>
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

                <p className="mt-4 text-gray-600 dark:text-gray-300">
                  {offer.description}
                </p>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700"
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