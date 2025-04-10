"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Send, Search, Phone, Video, MoreVertical, ChevronLeft, MessageCircle } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

// Mock conversations data
const conversations = [
  {
    id: 1,
    user: {
      id: 1,
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=50&width=50&text=JS",
      online: true,
      lastSeen: new Date(),
    },
    lastMessage: {
      text: "Hi, I'm interested in your MacBook Pro. Is it still available?",
      time: "10:30 AM",
      isRead: true,
      sender: "them",
    },
    unreadCount: 0,
  },
  {
    id: 2,
    user: {
      id: 2,
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=50&width=50&text=MJ",
      online: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    lastMessage: {
      text: "Great! I'll take it. When can we meet?",
      time: "Yesterday",
      isRead: false,
      sender: "them",
    },
    unreadCount: 2,
  },
  {
    id: 3,
    user: {
      id: 3,
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=50&width=50&text=SW",
      online: true,
      lastSeen: new Date(),
    },
    lastMessage: {
      text: "Thanks for the quick response!",
      time: "Yesterday",
      isRead: true,
      sender: "me",
    },
    unreadCount: 0,
  },
  {
    id: 4,
    user: {
      id: 4,
      name: "David Wilson",
      avatar: "/placeholder.svg?height=50&width=50&text=DW",
      online: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    lastMessage: {
      text: "I'll let you know if I'm interested.",
      time: "Monday",
      isRead: true,
      sender: "me",
    },
    unreadCount: 0,
  },
]

// Mock messages for a conversation
const mockMessages = [
  {
    id: 1,
    text: "Hi, I'm interested in your MacBook Pro. Is it still available?",
    time: "10:30 AM",
    sender: "them",
    status: "read",
  },
  {
    id: 2,
    text: "Yes, it's still available! It's in excellent condition.",
    time: "10:32 AM",
    sender: "me",
    status: "read",
  },
  {
    id: 3,
    text: "Great! What's the lowest you can go on the price?",
    time: "10:35 AM",
    sender: "them",
    status: "read",
  },
  {
    id: 4,
    text: "I can do $1100, but that's the lowest I can go. It's barely used and still under warranty.",
    time: "10:40 AM",
    sender: "me",
    status: "read",
  },
  {
    id: 5,
    text: "That works for me. When and where can we meet?",
    time: "10:42 AM",
    sender: "them",
    status: "read",
  },
  {
    id: 6,
    text: "How about tomorrow at 3pm at the university library?",
    time: "10:45 AM",
    sender: "me",
    status: "delivered",
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle sending a new message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sender: "me",
      status: "sending",
    }

    setMessages([...messages, newMsg])
    setNewMessage("")

    // Simulate message being delivered
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === newMsg.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)
  }

  // Get the selected conversation
  const currentConversation = conversations.find((conv) => conv.id === selectedConversation)

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
      <div className="flex h-full">
        {/* Conversations list */}
        <div
          className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${selectedConversation && isMobile ? "hidden" : "block"}`}
        >
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedConversation === conversation.id ? "bg-gray-50" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={conversation.user.avatar || "/placeholder.svg"}
                            alt={conversation.user.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        {conversation.user.online && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">{conversation.user.name}</h3>
                          <span className="text-xs text-gray-500">{conversation.lastMessage.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.sender === "me" && "You: "}
                            {conversation.lastMessage.text}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 bg-[#f58220] text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        {selectedConversation ? (
          <div className={`flex-1 flex flex-col ${!selectedConversation && isMobile ? "hidden" : "flex"}`}>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-100 flex items-center">
              {isMobile && (
                <button onClick={() => setSelectedConversation(null)} className="p-2 rounded-lg hover:bg-gray-100 mr-2">
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <div className="relative mr-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={currentConversation?.user.avatar || ""}
                    alt={currentConversation?.user.name || ""}
                    width={40}
                    height={40}
                    className="object-cover"
                  />
                </div>
                {currentConversation?.user.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{currentConversation?.user.name}</h3>
                <p className="text-xs text-gray-500">
                  {currentConversation?.user.online ? "Online" : "Last seen recently"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      message.sender === "me"
                        ? "bg-[#f58220] text-white rounded-br-none"
                        : "bg-white border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p>{message.text}</p>
                    <div
                      className={`text-xs mt-1 flex items-center justify-end ${
                        message.sender === "me" ? "text-white/70" : "text-gray-500"
                      }`}
                    >
                      {message.time}
                      {message.sender === "me" && (
                        <span className="ml-1">
                          {message.status === "sending" ? "✓" : message.status === "delivered" ? "✓✓" : "✓✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="ml-2 p-2 rounded-full bg-[#f58220] text-white disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Your Messages</h3>
              <p className="text-gray-500 max-w-md">
                Select a conversation to start chatting or search for a specific person.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
