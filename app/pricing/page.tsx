"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion"
import { Check, Star, AlertCircle, Package, Zap, Crown, Clock } from "lucide-react"
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
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  }

  const progressVariants = {
    initial: { width: 0 },
    animate: (value: number) => ({
      width: `${value}%`,
      transition: { duration: 1, ease: "easeOut" }
    })
  }

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const [tiersRes, currentSubRes] = await Promise.all([
          axiosInstance.get("/subscriptions"),
          axiosInstance.get("/subscriptions/current")
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
    <div className="min-h-screen bg-white dark:bg-gray-900 py-16 px-4 relative">
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-uniOrange origin-left z-50"
        style={{ scaleX }}
      />

      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.h1 
            className="text-5xl font-bold mb-6 text-gray-900 dark:text-white"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            Choose Your Plan
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Scale your business with flexible plans designed for merchants of all sizes
          </motion.p>
        </motion.div>

        {/* Current Subscription Status */}
        {currentSub && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="mb-16 bg-gray-50 dark:bg-gray-800 rounded-lg p-8 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Current Plan</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{currentSub.tier.name}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                currentSub.is_active 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
              }`}>
                {currentSub.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Request Views</p>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-uniOrange"
                    variants={progressVariants}
                    initial="initial"
                    animate="animate"
                    custom={(currentSub.views_used / currentSub.tier.request_view_limit) * 100}
                  />
                </div>
                <motion.p 
                  className="text-sm mt-2 text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {currentSub.views_used} / {currentSub.tier.request_view_limit}
                </motion.p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Offers</p>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-uniOrange"
                    variants={progressVariants}
                    initial="initial"
                    animate="animate"
                    custom={(currentSub.offers_used / currentSub.tier.offer_limit) * 100}
                  />
                </div>
                <motion.p 
                  className="text-sm mt-2 text-gray-600 dark:text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {currentSub.offers_used} / {currentSub.tier.offer_limit}
                </motion.p>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {currentSub.days_remaining} days remaining
            </div>
          </motion.div>
        )}

        {/* Pricing Tiers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400 }
              }}
              className={`
                relative bg-white dark:bg-gray-800 rounded-lg p-8
                border-2 transition-colors duration-300
                ${currentSub?.tier.id === tier.id 
                  ? 'border-uniOrange' 
                  : 'border-gray-100 dark:border-gray-700 hover:border-uniOrange/50'}
              `}
            >
              {/* Current Plan Badge */}
              {currentSub?.tier.id === tier.id && (
                <motion.div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="bg-uniOrange px-4 py-1 rounded-full text-sm font-medium text-white flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Star className="w-4 h-4" />
                    </motion.div>
                    Current Plan
                  </div>
                </motion.div>
              )}

              {/* Tier Header */}
              <motion.div 
                className="flex items-start gap-4 mb-6"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div 
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {tier.icon}
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tier.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{tier.description}</p>
                </div>
              </motion.div>

              {/* Price */}
              <motion.div 
                className="flex items-baseline mb-8"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  ₦{parseInt(tier.price).toLocaleString()}
                </span>
                <span className="ml-2 text-gray-500 dark:text-gray-400">/month</span>
              </motion.div>

              {/* Features */}
              <motion.ul 
                className="space-y-4 mb-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {tier.features?.map((feature, featureIndex) => (
                  <motion.li 
                    key={featureIndex}
                    variants={itemVariants}
                    className="flex items-center gap-3"
                  >
                    <motion.div 
                      className="flex-shrink-0"
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Check className="w-5 h-5 text-uniOrange" />
                    </motion.div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Subscribe Button */}
              <motion.div
                whileHover={!currentSub?.tier.id === tier.id ? { scale: 1.05 } : {}}
                whileTap={!currentSub?.tier.id === tier.id ? { scale: 0.95 } : {}}
              >
                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  className={`w-full border-2 ${
                    currentSub?.tier.id === tier.id
                      ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 border-uniOrange text-uniOrange hover:bg-uniOrange hover:text-white dark:hover:bg-uniOrange transition-all duration-300'
                  }`}
                  disabled={currentSub?.tier.id === tier.id}
                >
                  {currentSub?.tier.id === tier.id ? 'Current Plan' : 'Subscribe Now'}
                </Button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
} 