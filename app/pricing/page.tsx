"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Star, AlertCircle, Package, Zap, Crown } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import axiosInstance from "@/lib/axios"

interface Tier {
  id: number
  name: string
  price: string
  request_view_limit: number
  offer_limit: number
  description: string
  features?: string[]
  icon?: React.ReactNode
}

interface CurrentSubscription {
  tier: Tier
  start_date: string
  end_date: string
  is_active: boolean
  views_used: number
  offers_used: number
  days_remaining: number
}

// Enhanced tier features with UniStore specific benefits
const tierFeatures = {
  Basic: [
    "Basic request viewing",
    "Limited offer submissions",
    "Standard support",
    "Basic analytics"
  ],
  Professional: [
    "Priority request access",
    "Increased offer submissions",
    "24/7 support",
    "Advanced analytics",
    "Featured merchant status"
  ],
  Enterprise: [
    "Unlimited request views",
    "Maximum offer submissions",
    "Dedicated account manager",
    "Real-time analytics",
    "Priority placement",
    "Custom integrations"
  ]
}

export default function PricingPage() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const { theme } = useTheme()
  const { user } = useAuth()

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const [tiersRes, currentSubRes] = await Promise.all([
          axiosInstance.get("/api/subscriptions"),
          axiosInstance.get("/api/subscriptions/current")
        ])
        
        // Get tiers from the paginated response
        const tiersData = tiersRes.data.results || [];
        
        // Enhance tiers with icons and features
        const enhancedTiers = tiersData.map((tier: Tier) => ({
          ...tier,
          icon: tier.name === "Basic" || tier.name === "Free" ? <Package className="w-6 h-6" /> :
                tier.name === "Professional" ? <Zap className="w-6 h-6" /> :
                <Crown className="w-6 h-6" />,
          features: [
            // Add standard features based on limits
            `${tier.request_view_limit} Request Views`,
            `${tier.offer_limit} Offer Submissions`,
            // Add tier-specific features
            ...(tier.name === "Basic" || tier.name === "Free" ? [
              "Basic request viewing",
              "Standard support",
              "Basic analytics"
            ] : tier.name === "Professional" ? [
              "Priority request access",
              "24/7 support",
              "Advanced analytics",
              "Featured merchant status"
            ] : [
              "Unlimited request views",
              "Dedicated account manager",
              "Real-time analytics",
              "Priority placement",
              "Custom integrations"
            ])
          ]
        }))

        setTiers(enhancedTiers)
        
        // Set current subscription if it exists
        if (currentSubRes.data) {
          const subData = currentSubRes.data;
          setCurrentSub({
            tier: subData.tier,
            start_date: subData.start_date,
            end_date: subData.end_date,
            is_active: subData.is_active,
            views_used: subData.views_used,
            offers_used: subData.offers_used,
            days_remaining: subData.usage_stats.days_remaining
          })
        }
      } catch (error: any) {
        console.error("Error fetching subscription data:", error)
        toast.error(error.response?.data?.message || "Failed to load subscription information")
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionData()
  }, [])

  const handleSubscribe = async (tierId: number) => {
    try {
      // Create a new subscription with the selected tier
      const response = await axiosInstance.post(`/subscriptions/`, {
        tier_id: tierId
      })
      
      // If payment link is returned, redirect to it
      if (response.data.payment_link) {
        window.location.href = response.data.payment_link
      } else {
        // If no payment link (e.g. free tier), show success message
        toast.success("Subscription updated successfully!")
        // Refresh the page to show new subscription
        window.location.reload()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update subscription")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-uniOrange"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-uniOrange to-uniBlue">
              Choose Your Plan
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Scale your business with our flexible subscription plans
          </p>
        </motion.div>

        {/* Current Subscription Status */}
        {currentSub && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Subscription</h2>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full text-sm">
                {currentSub.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Request Views Usage</p>
                <Progress 
                  value={(currentSub.views_used / currentSub.tier.request_view_limit) * 100}
                  className="h-2 mb-1"
                />
                <p className="text-sm text-right">
                  {currentSub.views_used} / {currentSub.tier.request_view_limit}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-2">Offers Usage</p>
                <Progress 
                  value={(currentSub.offers_used / currentSub.tier.offer_limit) * 100}
                  className="h-2 mb-1"
                />
                <p className="text-sm text-right">
                  {currentSub.offers_used} / {currentSub.tier.offer_limit}
                </p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              {currentSub.days_remaining} days remaining
            </div>
          </motion.div>
        )}

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <AnimatePresence>
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg
                  ${currentSub?.tier.id === tier.id ? 
                    "border-2 border-uniOrange" : 
                    "border border-gray-200 dark:border-gray-700"}
                  hover:transform hover:-translate-y-2 transition-all duration-300
                `}
              >
                {/* Current Plan Badge */}
                {currentSub?.tier.id === tier.id && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-uniOrange text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Current Plan
                    </div>
                  </div>
                )}

                {/* Tier Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-uniOrange/10 rounded-lg">
                    {tier.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <p className="text-sm text-gray-500">{tier.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-uniOrange">₦{tier.price}</span>
                  <span className="ml-2 text-gray-500">/month</span>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {tier.features?.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-uniOrange" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Subscribe Button */}
                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  className={`w-full ${
                    currentSub?.tier.id === tier.id
                      ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                      : "bg-uniOrange hover:bg-uniOrange/90"
                  }`}
                  disabled={currentSub?.tier.id === tier.id}
                >
                  {currentSub?.tier.id === tier.id ? "Current Plan" : "Subscribe Now"}
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
} 