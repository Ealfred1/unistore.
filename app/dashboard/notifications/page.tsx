"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Bell, MessageCircle, ShoppingBag, Heart, Clock, Check, Trash2, CheckCheck } from "lucide-react"

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: "message",
    title: "New message from Jane Smith",
    description: "Hi, I'm interested in your MacBook Pro. Is it still available?",
    time: "2 hours ago",
    image: "/placeholder.svg?height=40&width=40&text=JS",
    read: false,
    actionUrl: "/dashboard/messages",
  },
  {
    id: 2,
    type: "offer",
    title: "Offer accepted",
    description: "Your offer for iPhone 13 Pro has been accepted by Mike Johnson",
    time: "Yesterday",
    image: "/placeholder.svg?height=40&width=40&text=iPhone",
    read: false,
    actionUrl: "/dashboard/messages",
  },
  {
    id: 3,
    type: "favorite",
    title: "New favorite",
    description: "Sarah Williams saved your Sony Headphones listing",
    time: "2 days ago",
    image: "/placeholder.svg?height=40&width=40&text=Sony",
    read: true,
    actionUrl: "/dashboard/my-products",
  },
  {
    id: 4,
    type: "system",
    title: "Welcome to UniStore!",
    description: "Complete your profile to get started with buying and selling.",
    time: "1 week ago",
    image: "/placeholder.svg?height=40&width=40&text=Uni",
    read: true,
    actionUrl: "/dashboard/profile",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all")
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading and get notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(mockNotifications)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === "all" ? notifications : notifications.filter((n) => !n.read)

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  // Delete notification
  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case "offer":
        return <ShoppingBag className="h-5 w-5 text-green-500" />
      case "favorite":
        return <Heart className="h-5 w-5 text-pink-500" />
      case "system":
        return <Bell className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Get background color based on notification type
  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "message":
        return "bg-blue-100"
      case "offer":
        return "bg-green-100"
      case "favorite":
        return "bg-pink-100"
      case "system":
        return "bg-purple-100"
      default:
        return "bg-gray-100"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-500">
            {notifications.filter((n) => !n.read).length} unread{" "}
            {notifications.filter((n) => !n.read).length === 1 ? "notification" : "notifications"}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={markAllAsRead}
            disabled={!notifications.some((n) => !n.read)}
            className="px-4 py-2 rounded-xl border border-gray-300 flex items-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all as read</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-[#f58220] text-[#f58220]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "unread"
                ? "border-[#f58220] text-[#f58220]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* Notifications list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md border border-gray-100 animate-pulse p-6">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-gray-200 mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 ${!notification.read ? "border-l-4 border-l-[#f58220]" : ""}`}
            >
              <div className="flex items-start">
                <div
                  className={`w-10 h-10 rounded-full ${getNotificationBgColor(notification.type)} flex items-center justify-center mr-4`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{notification.title}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {notification.time}
                      </span>
                      <div className="flex">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-1">{notification.description}</p>
                  <div className="mt-3">
                    <Link
                      href={notification.actionUrl}
                      className="text-sm font-medium text-[#f58220] hover:text-[#f58220]/80"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-gray-500">
            {activeTab === "unread" ? "You have no unread notifications" : "You have no notifications"}
          </p>
        </div>
      )}
    </div>
  )
}
