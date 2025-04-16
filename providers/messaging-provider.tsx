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
  const wsRef = useRef<WebSocketManager | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastMessage, setLastMessage] = useState<Message | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token || !user) return

    if (!wsRef.current) {
      wsRef.current = new WebSocketManager(token)
      
      // Handle new messages
      wsRef.current.addMessageHandler('new_message', (data) => {
        const newMessage = data.message;
        
        // Only show toast if not on messages page
        if (!pathname.startsWith('/dashboard/messages')) {
          toast(`New message from ${newMessage.sender_name}`, {
            description: newMessage.content,
            action: {
              label: "View",
              onClick: () => {
                window.location.href = `/dashboard/messages?conversation=${newMessage.conversation_id}`;
              }
            }
          });
        }

        // Update unread count
        setUnreadCount(prev => prev + 1);
        setLastMessage(newMessage);
      });

      wsRef.current.connect()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect()
        wsRef.current = null
      }
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