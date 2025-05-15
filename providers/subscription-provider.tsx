"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export interface SubscriptionData {
  end_date: string
  is_active: boolean
  offer_limit: number
  offer_usage_percent: number
  offers_used: number
  tier_name: string
  view_limit: number
  view_usage_percent: number
  views_used: number
  days_remaining?: number
  hours_remaining?: number
}

interface SubscriptionContextType {
  subscriptionData: SubscriptionData | null
  setSubscriptionData: (data: SubscriptionData) => void
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionData: null,
  setSubscriptionData: () => {},
})

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [limitType, setLimitType] = useState<"views" | "offers" | null>(null)
  const router = useRouter()

  const updateSubscriptionData = (data: SubscriptionData) => {
    setSubscriptionData(data)

    // Check for limits and show appropriate modals
    if (data.offer_usage_percent >= 100 || data.view_usage_percent >= 100) {
      setLimitType(data.offer_usage_percent >= 100 ? "offers" : "views")
      setShowLimitModal(true)
      toast.error(`You have reached your ${limitType} limit for your current subscription tier`)
    } else if (data.offer_usage_percent >= 80 || data.view_usage_percent >= 80) {
      setLimitType(data.offer_usage_percent >= 80 ? "offers" : "views")
      setShowWarningModal(true)
      toast.warning(`You are approaching your ${limitType} limit`)
    }
  }

  // Listen for WebSocket subscription events
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/")

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === "subscription.usage") {
        updateSubscriptionData(data.data)
      } else if (data.type === "subscription.limit_reached") {
        toast.error(data.error)
        setLimitType(data.error.includes("offer") ? "offers" : "views")
        setShowLimitModal(true)
      } else if (data.type === "error") {
        // Handle general subscription errors
        toast.error(data.message)
        if (data.message.includes("limit")) {
          setLimitType(data.message.includes("offer") ? "offers" : "views")
          setShowLimitModal(true)
        }
      }
    }

    return () => ws.close()
  }, [])

  return (
    <SubscriptionContext.Provider value={{ subscriptionData, setSubscriptionData }}>
      {children}

      {/* Limit Reached Modal */}
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Subscription Limit Reached
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              You have reached your {limitType} limit for your current subscription tier ({subscriptionData?.tier_name}).
              To continue using this feature, please upgrade your subscription.
            </p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Usage:</p>
              <div className="space-y-1">
                <Progress 
                  value={limitType === "offers" ? subscriptionData?.offer_usage_percent : subscriptionData?.view_usage_percent} 
                  className="h-2"
                  indicatorColor="bg-red-600"
                />
                <p className="text-sm text-right text-red-600">
                  {limitType === "offers" 
                    ? `${subscriptionData?.offers_used} / ${subscriptionData?.offer_limit} offers`
                    : `${subscriptionData?.views_used} / ${subscriptionData?.view_limit} views`
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowLimitModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                setShowLimitModal(false)
                router.push("/pricing")
              }}>
                Upgrade Subscription
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warning Modal */}
      <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              Approaching Subscription Limit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              You are approaching your {limitType} limit for your current subscription tier ({subscriptionData?.tier_name}).
              Consider upgrading your subscription to avoid interruption.
            </p>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Usage:</p>
              <div className="space-y-1">
                <Progress 
                  value={limitType === "offers" ? subscriptionData?.offer_usage_percent : subscriptionData?.view_usage_percent} 
                  className="h-2"
                  indicatorColor="bg-yellow-600"
                />
                <p className="text-sm text-right text-yellow-600">
                  {limitType === "offers" 
                    ? `${subscriptionData?.offers_used} / ${subscriptionData?.offer_limit} offers`
                    : `${subscriptionData?.views_used} / ${subscriptionData?.view_limit} views`
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowWarningModal(false)}>
                Dismiss
              </Button>
              <Button onClick={() => {
                setShowWarningModal(false)
                router.push("/pricing")
              }}>
                View Plans
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
} 