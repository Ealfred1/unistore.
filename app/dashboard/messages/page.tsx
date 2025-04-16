"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useMessaging } from "@/hooks/useMessaging"
import Image from "next/image"
import { Send, Phone, Video, MoreVertical, MessageCircle, Search, ArrowLeft } from "lucide-react"

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
    conversations = [],
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

  // Add debug logging
  useEffect(() => {
    console.log('Current conversations:', conversations);
  }, [conversations]);

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

  // Ensure conversations is an array before filtering
  const filteredConversations = Array.isArray(conversations) 
    ? conversations.filter(conv => {
        const searchLower = searchQuery.toLowerCase()
        const fullName = `${conv.other_user.first_name} ${conv.other_user.last_name}`.toLowerCase()
        return fullName.includes(searchLower)
      })
    : [];

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
    <div className="flex h-[calc(100vh-4rem)] bg-secondary-50 dark:bg-secondary-900">
      {/* Left Sidebar - Conversations List */}
      <div className={`
        w-full md:w-1/3 lg:w-[380px] bg-white dark:bg-secondary-800 flex flex-col
        ${currentConversation ? 'hidden md:block' : 'block'}
      `}>
        {/* Header */}
        <div className="p-4 h-16 bg-uniOrange-400/90 dark:bg-uniOrange-500/90 flex items-center">
          <div className="flex items-center justify-between w-full">
            <h1 className="text-white font-semibold text-xl">Messages</h1>
            <MoreVertical className="w-5 h-5 text-white cursor-pointer" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 bg-white dark:bg-secondary-800 border-b border-secondary-100 dark:border-secondary-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-12 rounded-full bg-secondary-100 dark:bg-secondary-700
                focus:outline-none focus:ring-2 focus:ring-uniOrange-400 transition-all
                text-secondary-900 dark:text-white placeholder-secondary-400"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {Array.isArray(conversations) && conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-secondary-500">
              <MessageCircle className="w-12 h-12 mb-2" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => startConversation(conversation.other_user.id)}
                className={`
                  p-4 border-b border-secondary-100 dark:border-secondary-700
                  hover:bg-secondary-50 dark:hover:bg-secondary-700/50 cursor-pointer
                  ${currentConversation?.id === conversation.id 
                    ? 'bg-secondary-100 dark:bg-secondary-700' 
                    : ''
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-uniBlue-500 flex items-center justify-center text-white font-medium">
                      {conversation.other_user.first_name[0]}
                    </div>
                    {conversation.other_user.is_online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-uniOrange-400 rounded-full border-2 border-white dark:border-secondary-800" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate dark:text-white">
                        {conversation.other_user.first_name} {conversation.other_user.last_name}
                        {conversation.other_user.merchant_verified && (
                          <span className="ml-1 text-uniOrange-500">✓</span>
                        )}
                      </h3>
                      <span className="text-xs text-secondary-500 whitespace-nowrap ml-2">
                        {new Date(conversation.last_message_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-secondary-500 truncate">
                        {conversation.last_message?.content || 'No messages yet'}
                      </p>
                      {conversation.unread_count > 0 && (
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-uniOrange-400 text-white text-xs flex items-center justify-center">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className={`
        flex-1 flex flex-col bg-[#f5f1eb] dark:bg-secondary-900
        ${currentConversation ? 'block' : 'hidden md:block'}
      `}>
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-uniOrange-400/90 dark:bg-uniOrange-500/90 h-16">
              <div className="flex items-center h-full px-4 gap-3">
                {/* Mobile Back Button */}
                <button 
                  onClick={() => startConversation(null)}
                  className="md:hidden text-white p-1 -ml-1"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="w-10 h-10 rounded-full bg-uniBlue-500 flex items-center justify-center text-white">
                  {currentConversation.other_user.first_name[0]}
                </div>
                <div className="flex-1">
                  <h2 className="font-medium text-white">
                    {currentConversation.other_user.first_name} {currentConversation.other_user.last_name}
                  </h2>
                  <p className="text-sm text-white/90">
                    {currentConversation.other_user.is_online ? 'Online' : 'Offline'}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-white">
                  <Phone className="w-5 h-5 cursor-pointer hover:text-white/80" />
                  <Video className="w-5 h-5 cursor-pointer hover:text-white/80" />
                  <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white/80" />
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {currentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${isSentByMe(message) ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`
                      max-w-[70%] px-4 py-2 rounded-lg
                      ${isSentByMe(message)
                        ? "bg-uniOrange-100 text-secondary-900"
                        : "bg-white text-secondary-900"
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 text-xs text-secondary-500">
                      <span>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {isSentByMe(message) && (
                        <span className="text-uniOrange-500">
                          {message.is_read ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-4 py-3 bg-white dark:bg-secondary-800 border-t border-secondary-100 dark:border-secondary-700">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-secondary-100 dark:bg-secondary-700
                    focus:outline-none focus:ring-2 focus:ring-uniOrange-400 transition-all
                    text-secondary-900 dark:text-white placeholder-secondary-400"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2.5 rounded-full bg-uniOrange-400 hover:bg-uniOrange-500 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-secondary-500">
            <MessageCircle className="w-16 h-16 mb-4" />
            <p className="text-lg">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  )
}