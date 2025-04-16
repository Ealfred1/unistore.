"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useMessaging } from "@/hooks/useMessaging"
import Image from "next/image"
import { Send, Phone, Video, MoreVertical, MessageCircle } from "lucide-react"

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
  conversation_id: string
  attachments?: Array<{
    id: string
    file_name: string
    file_url: string
  }>
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [token, setToken] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      console.log('Current user ID:', user.id);
    }
  }, [user]);

  useEffect(() => {
    setToken(localStorage.getItem("access_token") || "")
  }, [])

  const { 
    conversations, 
    currentMessages, 
    onlineMerchants,
    currentConversation,
    getConversations, 
    getMessages, 
    sendMessage, 
    markAsRead, 
    startConversation,
    isStartingConversation
  } = useMessaging(token)

  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initial load of conversations
  useEffect(() => {
    getConversations()
  }, [getConversations])

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation?.id) {
      getMessages(currentConversation.id)
    }
  }, [currentConversation?.id, getMessages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentMessages])

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (currentConversation?.id && currentMessages.length > 0) {
      const lastMessage = currentMessages[currentMessages.length - 1]
      if (!isSentByMe(lastMessage) && !lastMessage.is_read) {
        markAsRead(currentConversation.id, lastMessage.id)
      }
    }
  }, [currentConversation?.id, currentMessages, markAsRead])

  // Handle URL parameter for conversation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get('conversation');
    
    if (conversationId) {
      const conversation = conversations.find(conv => conv.id === conversationId);
      if (conversation) {
        startConversation(conversation.other_user.id);
      }
    }
  }, [conversations, startConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentConversation?.id) return

    try {
      await sendMessage(currentConversation.id, newMessage.trim())
      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    conv.other_user && (
      conv.other_user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.other_user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  // Handle merchant click
  const handleMerchantClick = async (merchantId: string) => {
    try {
      setError(null);
      await startConversation(merchantId);
      // The conversation will be set in the hook
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to start conversation');
      setTimeout(() => setError(null), 3000);
    }
  }

  const isSentByMe = useCallback((message: Message) => {
    if (!user) return false;
    const isFromMe = String(message.sender_id) === String(user.id);
    return isFromMe;
  }, [user]);

  const renderMessage = (message: Message) => {
    const fromMe = isSentByMe(message);
    
    return (
      <div
        key={`${message.id}-${message.conversation_id}`}
        className={`flex ${fromMe ? "justify-end" : "justify-start"} mb-4`}
      >
        <div 
          className={`
            relative max-w-[70%] px-4 py-2 rounded-lg
            ${fromMe 
              ? "bg-[#f58220] text-white rounded-tr-none ml-auto" 
              : "bg-blue-500 text-white rounded-tl-none mr-auto"
            }
          `}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          
          {/* Time and read receipt */}
          <div 
            className={`
              flex items-center justify-end gap-1 mt-1 text-xs
              ${fromMe ? "text-white/70" : "text-white/70"}
            `}
          >
            <span>
              {new Date(message.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            
            {/* Only show read receipts for messages sent by current user */}
            {fromMe && (
              <span className="flex items-center ml-1">
                {message.is_read ? (
                  // Double tick for read messages
                  <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24">
                    <path 
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      d="M 2 12 L 6 16 L 14 8 M 6 12 L 10 16 L 18 8"
                    />
                  </svg>
                ) : (
                  // Single tick for sent but unread messages
                  <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24">
                    <path 
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      d="M 4 12 L 8 16 L 16 8"
                    />
                  </svg>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="flex h-full">
        {/* Conversations List */}
        <div className="w-full md:w-80 border-r border-gray-200 flex flex-col">
          {/* Online Merchants Section */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Online Merchants</h3>
            <div className="space-y-2">
              {onlineMerchants.length === 0 ? (
                <p className="text-gray-500 text-sm">No merchants online</p>
              ) : (
                onlineMerchants.map((merchant) => ( 
                  <div
                    key={merchant.id}
                    onClick={() => handleMerchantClick(merchant.id)}
                    className={`flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer
                      ${isStartingConversation ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <Image
                          src={merchant.profile_image || "/placeholder.png"}
                          alt={`${merchant.first_name} ${merchant.last_name}`}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {merchant.first_name} {merchant.last_name}
                      </p>
                      {merchant.merchant_name && (
                        <p className="text-xs text-gray-500">{merchant.merchant_name}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => startConversation(conv.other_user.id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  currentConversation?.id === conv.id ? "bg-gray-50" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={conv.other_user.profile_image || "/placeholder.png"}
                        alt={`${conv.other_user.first_name} ${conv.other_user.last_name}`}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    {conv.other_user.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {conv.other_user.first_name} {conv.other_user.last_name}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.last_message?.content || "No messages yet"}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <div className="bg-[#f58220] text-white text-xs rounded-full px-2 py-1">
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {currentConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={currentConversation.other_user.profile_image || "/placeholder.png"}
                      alt={`${currentConversation.other_user.first_name} ${currentConversation.other_user.last_name}`}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  {currentConversation.other_user.is_online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">
                    {currentConversation.other_user.first_name} {currentConversation.other_user.last_name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {currentConversation.other_user.is_online ? "Online" : "Offline"}
                  </p>
                </div>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentMessages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
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
                  className="p-2 rounded-full bg-[#f58220] text-white disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Your Messages</h3>
              <p className="text-gray-500">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}