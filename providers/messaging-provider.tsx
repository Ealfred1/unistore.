"use client"

import { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'
import { WebSocketManager } from '@/utils/websocket'
import { usePathname as useNextPathname } from 'next/navigation'

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
  storedConversations: any[]
  storeOfflineMessage: (conversationId: string, content: string) => void
}

const MessagingContext = createContext<MessagingContextType>({
  wsInstance: null,
  isConnected: false,
  unreadCount: 0,
  lastMessage: null,
  markAllRead: () => {},
  storedConversations: [],
  storeOfflineMessage: () => {}
})

export function MessagingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const wsRef = useRef<WebSocketManager>(WebSocketManager.getInstance())
  const [isConnected, setIsConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastMessage, setLastMessage] = useState<Message | null>(null)
  const pathname = useNextPathname()
  const [storedConversations, setStoredConversations] = useState<any[]>([])
  const pendingMessagesRef = useRef<{[key: string]: any[]}>({})

  // Load stored conversations on mount
  useEffect(() => {
    const stored = localStorage.getItem('stored_conversations')
    if (stored) {
      try {
        setStoredConversations(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse stored conversations:', e)
      }
    }
  }, [])

  // Store conversations when they update
  useEffect(() => {
    if (storedConversations.length > 0) {
      localStorage.setItem('stored_conversations', JSON.stringify(storedConversations))
    }
  }, [storedConversations])

  // Update WebSocket connection management
  useEffect(() => {
    if (!user?.id) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = wsRef.current;
    ws.cleanup();
    ws.updateToken(token);
    ws.setPersistentConnection(true);

    // Update connection status handlers
    const handleConnect = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.addMessageHandler('connection_established', handleConnect);
    ws.onDisconnect(handleDisconnect);
    ws.connect();

    return () => {
      ws.removeMessageHandler('connection_established', handleConnect);
    };
  }, [user?.id]);

  // Store new messages when offline
  const storeOfflineMessage = (conversationId: string, content: string) => {
    if (!pendingMessagesRef.current[conversationId]) {
      pendingMessagesRef.current[conversationId] = [];
    }
    pendingMessagesRef.current[conversationId].push({
      content,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('pending_messages', JSON.stringify(pendingMessagesRef.current));
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token || !user) return

    wsRef.current.updateToken(token)
    
    const handleNewMessage = (data: any) => {
      const newMessage = data.message;
      console.log('New message received:', newMessage);
      
      // Safe check for pathname
      const currentPath = pathname || '';
      
      // Only show toast if not on messages page and message is not from current user
      if (
        !currentPath.includes('/dashboard/messages') && 
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

      // Update unread count for messages not from current user
      if (String(newMessage.sender_id) !== String(user.id)) {
        setUnreadCount(prev => prev + 1);
        setLastMessage(newMessage);
      }
    }

    wsRef.current.addMessageHandler('new_message', handleNewMessage)

    return () => {
      wsRef.current.removeMessageHandler('new_message', handleNewMessage)
    }
  }, [user, pathname]);

  const markAllRead = () => {
    setUnreadCount(0)
  }

  const contextValue = useMemo(() => ({
    wsInstance: wsRef.current,
    isConnected,
    unreadCount,
    lastMessage,
    markAllRead,
    storedConversations,
    storeOfflineMessage
  }), [isConnected, unreadCount, lastMessage, storedConversations]);

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  )
}

export const useMessagingContext = () => useContext(MessagingContext) 