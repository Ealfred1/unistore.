"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  MessageSquare,
  Star,
  BadgeCheck,
  Clock,
  Store,
  SendHorizonal,
  ArrowLeft,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"

// Dummy data - replace with real data
const acceptedOffer = {
  id: "1",
  request: {
    title: "Chemistry 101 Textbook",
    description: "Need the latest edition of Chemistry 101 by John Smith. Preferably in good condition.",
    category: "📚 Textbooks",
    createdAt: "2024-03-15T10:00:00Z"
  },
  merchant: {
    name: "Campus Bookstore",
    image: "https://ui-avatars.com/api/?name=Campus+Bookstore",
    rating: 4.8,
    verified: true,
    email: "contact@campusbookstore.com",
    phone: "+234 123 456 7890"
  },
  price: 15000,
  description: "We have a new copy of Chemistry 101, latest edition available.",
  acceptedAt: "2024-03-16T14:30:00Z"
}

export default function AcceptedRequestPage() {
  const router = useRouter()
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [message, setMessage] = useState("")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleSendMessage = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Message sent successfully! 📨")
      setShowMessageModal(false)
      setMessage("")
    } catch (error) {
      toast.error("Failed to send message")
    }
  }

  return (
    <div className="lg:container max-w-4xl py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Requests
      </Button>

      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-uniOrange to-uniOrange-600 rounded-xl p-6 text-white mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Request Accepted! 🎉</h1>
            <p className="text-white/90">
              Your request has been successfully matched with a merchant
            </p>
          </div>
          <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>
      </motion.div>

      {/* Request Details */}
      <div className="grid gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                Accepted ✨
              </span>
              <h2 className="text-xl font-semibold mt-3">{acceptedOffer.request.title}</h2>
              <p className="text-gray-500 mt-1">
                Accepted on {formatDate(acceptedOffer.acceptedAt)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-uniOrange">
                ₦{acceptedOffer.price.toLocaleString()}
              </div>
              <span className="inline-block mt-2 px-3 py-1 bg-uniOrange/10 text-uniOrange rounded-full text-sm">
                {acceptedOffer.request.category}
              </span>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {acceptedOffer.request.description}
          </p>
        </motion.div>

        {/* Merchant Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Store className="h-5 w-5 mr-2 text-uniOrange" />
            Merchant Details
          </h3>

          <div className="flex items-start space-x-4 mb-6">
            <div className="relative h-16 w-16 rounded-full overflow-hidden">
              <Image
                src={acceptedOffer.merchant.image}
                alt={acceptedOffer.merchant.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center">
                <h4 className="text-lg font-semibold">{acceptedOffer.merchant.name}</h4>
                {acceptedOffer.merchant.verified && (
                  <BadgeCheck className="h-5 w-5 ml-1 text-uniOrange" />
                )}
              </div>
              <div className="flex items-center mt-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm text-gray-500">
                  {acceptedOffer.merchant.rating} rating
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Mail className="h-4 w-4 mr-2" />
              {acceptedOffer.merchant.email}
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Phone className="h-4 w-4 mr-2" />
              {acceptedOffer.merchant.phone}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button 
              className="bg-uniBlue hover:bg-uniBlue-600 text-white"
              onClick={() => setShowMessageModal(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {acceptedOffer.merchant.name}</DialogTitle>
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