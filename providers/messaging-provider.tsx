"use client"

import { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'
import { WebSocketManager } from '@/utils/websocket'
import { usePathname } from '@/hooks/usePathname'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_read: boolean
  conversation_id: string
  sender_name?: string
}

interface MessagingContextType {
  wsInstance: WebSocketManager | null
  isConnected: boolean
  unreadCount: number
  lastMessage: Message | null
  markAllRead: () => void
}

const MessagingContext = createContext<MessagingContextType>({
  wsInstance: null,
  isConnected: false,
  unreadCount: 0,
  lastMessage: null,
  markAllRead: () => {}
})

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const wsRef = useRef<WebSocketManager>(WebSocketManager.getInstance())
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastMessage, setLastMessage] = useState<Message | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token || !user) return

    // Update token instead of creating new instance
    wsRef.current.updateToken(token)
    
    // Handle new messages
    const handleNewMessage = (data: any) => {
      const newMessage = data.message;
      console.log(newMessage)
      
      // Only show toast if:
      // 1. Not on messages page
      // 2. Message is not from current user
      if (
        !pathname.startsWith('/dashboard/messages') && 
        String(newMessage.sender_id) !== String(user.id)
      ) {
        const senderName = newMessage.sender_name || 'Unknown';
        const initial = senderName[0].toUpperCase();
        const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        toast(
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${randomColor} flex items-center justify-center text-white text-sm font-medium`}>
              {initial}
            </div>
            <div>
              <p className="font-medium">{senderName}</p>
              <p className="text-sm text-gray-600">{newMessage.content}</p>
            </div>
          </div>,
          {
            action: {
              label: "View",
              onClick: () => {
                window.location.href = `/dashboard/messages?conversation=${newMessage.conversation_id}`;
              }
            }
          }
        );
      }

      // Only update unread count if message is not from current user
      if (String(newMessage.sender_id) !== String(user.id)) {
        setUnreadCount(prev => prev + 1);
        setLastMessage(newMessage);
      }
    }

    wsRef.current.addMessageHandler('new_message', handleNewMessage)

    return () => {
      wsRef.current.removeMessageHandler('new_message', handleNewMessage)
    }
  }, [user, pathname])

  const markAllRead = () => {
    // Implement mark all as read functionality
    setUnreadCount(0)
  }

  // Provide WebSocket instance to children
  const contextValue = useMemo(() => ({
    wsInstance: wsRef.current,
    isConnected,
    unreadCount,
    lastMessage,
    markAllRead
  }), [isConnected, unreadCount, lastMessage])

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  )
}

export const useMessagingContext = () => useContext(MessagingContext)