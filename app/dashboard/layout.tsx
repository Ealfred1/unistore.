"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Bell } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import EnhancedSidebar from "@/components/dashboard/enhanced-sidebar"
import { useRouter } from "next/navigation"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const router = useRouter()

  // Check if user is authenticated
  useEffect(() => {
    // Wait until loading is complete before checking authentication
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f58220]"></div>
      </div>
    )
  }

  // If not authenticated and not loading, the useEffect will redirect
  // This is just a fallback in case the redirect hasn't happened yet
  if (!user && !isLoading) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Sidebar */}
      <EnhancedSidebar />

      {/* Main content */}
      <div className="md:pl-[280px] transition-all duration-300 pt-16 md:pt-0">
        <div className="container py-8">{children}</div>
      </div>

      {/* Floating request button */}
      <button
        onClick={() => setShowRequestModal(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-[#f58220] to-[#0a2472] text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-all"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Notifications button (mobile) */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-full glassmorphism shadow-lg"
      >
        <Bell className="h-5 w-5" />
      </button>
    </div>
  )
}
