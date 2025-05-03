"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  CheckCircle2,
  XCircle,
  MessageSquare,
  Store,
  Star,
  Clock,
  BadgeCheck,
  Filter,
  Search,
  Loader2,
  SendHorizonal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Dummy data
const offers = [
  {
    id: "1",
    request: {
      title: "Chemistry 101 Textbook",
      category: "📚 Textbooks"
    },
    merchant: {
      name: "Campus Bookstore",
      image: "https://ui-avatars.com/api/?name=Campus+Bookstore",
      rating: 4.8,
      verified: true
    },
    price: 15000,
    description: "We have a new copy of Chemistry 101, latest edition available.",
    status: "pending",
    createdAt: "2024-03-15T11:30:00Z"
  },
  {
    id: "2",
    request: {
      title: "Scientific Calculator",
      category: "💻 Electronics"
    },
    merchant: {
      name: "Tech Hub",
      image: "https://ui-avatars.com/api/?name=Tech+Hub",
      rating: 4.5,
      verified: false
    },
    price: 25000,
    description: "Brand new TI-84 Plus calculator with warranty.",
    status: "pending",
    createdAt: "2024-03-15T10:15:00Z"
  },
  // Add more dummy offers...
]

export default function OffersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [filteredOffers, setFilteredOffers] = useState(offers)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    let filtered = offers
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(offer => 
        offer.request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(offer => offer.status === statusFilter)
    }
    
    setFilteredOffers(filtered)
  }, [searchQuery, statusFilter])

  const handleAcceptOffer = async (offerId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success("Offer accepted! 🎉")
  }

  const handleRejectOffer = async (offerId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success("Offer rejected")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleMessageMerchant = (merchant: any) => {
    setSelectedMerchant(merchant)
    setShowMessageModal(true)
  }

  const handleSendMessage = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Message sent to merchant! 📨")
      setShowMessageModal(false)
      setMessage("")
    } catch (error) {
      toast.error("Failed to send message")
    }
  }

  return (
    <div className="lg:container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Offers 📬</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent"
            />
          </div>
          <Button variant="outline" className="border-gray-200 dark:border-gray-700">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex space-x-2 mb-6">
        {["all", "pending", "accepted", "rejected"].map((status) => (
          <Button
            key={status}
            variant="outline"
            className={`capitalize ${
              statusFilter === status
                ? "bg-uniOrange/10 text-uniOrange border-uniOrange"
                : "border-gray-200 dark:border-gray-700"
            }`}
            onClick={() => setStatusFilter(status as any)}
          >
            {status}
          </Button>
        ))}
      </div>

      {/* Loading and Empty States */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-uniOrange" />
            <p className="text-gray-500">Loading offers...</p>
          </div>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-lg font-semibold">No offers found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "You haven't received any offers yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOffers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{offer.request.title}</h2>
                  <span className="inline-block mt-1 px-3 py-1 bg-uniOrange/10 text-uniOrange rounded-full text-sm">
                    {offer.request.category}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-uniOrange">
                    ₦{offer.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatDate(offer.createdAt)}
                  </div>
                </div>
              </div>

              <div className="flex items-center mb-4">
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
                    <h3 className="font-semibold">{offer.merchant.name}</h3>
                    {offer.merchant.verified && (
                      <BadgeCheck className="h-4 w-4 ml-1 text-uniOrange" />
                    )}
                  </div>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-500">
                      {offer.merchant.rating}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {offer.description}
              </p>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  className="border-gray-200 dark:border-gray-700"
                  onClick={() => handleRejectOffer(offer.id)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-uniOrange hover:bg-uniOrange-600 text-white"
                  onClick={() => handleAcceptOffer(offer.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button className="bg-uniBlue hover:bg-uniBlue-600 text-white" onClick={() => handleMessageMerchant(offer.merchant)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {selectedMerchant?.name}</DialogTitle>
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