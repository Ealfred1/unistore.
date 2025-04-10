"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Bell, MessageCircle, ShoppingBag, Heart, Clock, Check, Trash2, CheckCheck } from "lucide-react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {notifications.filter((n) => !n.read).length} unread{" "}
            {notifications.filter((n) => !n.read).length === 1 ? "notification" : "notifications"}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={markAllAsRead}
            disabled={!notifications.some((n) => !n.read)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all as read</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "unread")}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-muted mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                >
                  <Card className={`border ${!notification.read ? "border-l-4 border-l-[#f58220]" : ""}`}>
                    <CardContent className="p-6">
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
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {notification.time}
                              </span>
                              <div className="flex">
                                {!notification.read && (
                                  <Button
                                    onClick={() => markAsRead(notification.id)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    title="Mark as read"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  onClick={() => deleteNotification(notification.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground mt-1">{notification.description}</p>
                          <div className="mt-3">
                            <Button
                              asChild
                              variant="link"
                              className="p-0 h-auto text-[#f58220] hover:text-[#f58220]/80"
                            >
                              <Link href={notification.actionUrl}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="mb-2">No notifications</CardTitle>
                <p className="text-muted-foreground">
                  {activeTab === "unread" ? "You have no unread notifications" : "You have no notifications"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-muted mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                >
                  <Card className="border border-l-4 border-l-[#f58220]">
                    <CardContent className="p-6">
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
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {notification.time}
                              </span>
                              <div className="flex">
                                <Button
                                  onClick={() => markAsRead(notification.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Mark as read"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => deleteNotification(notification.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground mt-1">{notification.description}</p>
                          <div className="mt-3">
                            <Button
                              asChild
                              variant="link"
                              className="p-0 h-auto text-[#f58220] hover:text-[#f58220]/80"
                            >
                              <Link href={notification.actionUrl}>View Details</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="mb-2">No unread notifications</CardTitle>
                <p className="text-muted-foreground">You're all caught up!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
