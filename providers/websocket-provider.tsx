"use client"

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { WebSocketManager } from '@/utils/websocket'
import { RequestWebSocketManager } from '@/utils/request-socket'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'

interface WebSocketContextType {
  messagingWs: WebSocketManager | null
  requestWs: RequestWebSocketManager | null
  isMessagingConnected: boolean
  isRequestConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
  messagingWs: null,
  requestWs: null,
  isMessagingConnected: false,
  isRequestConnected: false
})

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const messagingWsRef = useRef<WebSocketManager>(WebSocketManager.getInstance())
  const requestWsRef = useRef<RequestWebSocketManager>(RequestWebSocketManager.getInstance())
  const [isMessagingConnected, setIsMessagingConnected] = useState(false)
  const [isRequestConnected, setIsRequestConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Sequential connection manager
  const connectWebSockets = async () => {
    if (isConnecting) return
    setIsConnecting(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token || !user?.id) {
        throw new Error('No token or user available')
      }

      // First, connect messaging WebSocket
      console.log('Initializing Messaging WebSocket connection...')
      messagingWsRef.current.cleanup()
      messagingWsRef.current.updateToken(token)
      messagingWsRef.current.setPersistentConnection(true)
      
      // Wait for messaging connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Messaging connection timeout')), 15000)
        
        messagingWsRef.current.onDisconnect(() => {
          setIsMessagingConnected(false)
          console.log('Messaging WebSocket disconnected')
        })

        // Check if connection is already established
        if (messagingWsRef.current.isConnected()) {
          console.log('Messaging WebSocket already connected')
          clearTimeout(timeout)
          setIsMessagingConnected(true)
          resolve()
          return
        }

        const handleOpen = () => {
          console.log('Messaging WebSocket connected')
          setIsMessagingConnected(true)
          clearTimeout(timeout)
          resolve()
        }

        messagingWsRef.current.socket?.addEventListener('open', handleOpen)
        messagingWsRef.current.connect()

        return () => {
          messagingWsRef.current.socket?.removeEventListener('open', handleOpen)
        }
      })

      console.log('Messaging connection established, initializing Request WebSocket...')

      // After messaging is connected, connect request WebSocket
      requestWsRef.current.cleanup()
      requestWsRef.current.updateToken(token)
      requestWsRef.current.setPersistentConnection(true)

      // Wait for request connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Request connection timeout')), 15000)

        requestWsRef.current.onDisconnect(() => {
          setIsRequestConnected(false)
          console.log('Request WebSocket disconnected')
        })

        // Check if connection is already established
        if (requestWsRef.current.isConnected()) {
          console.log('Request WebSocket already connected')
          clearTimeout(timeout)
          setIsRequestConnected(true)
          resolve()
          return
        }

        const handleOpen = () => {
          console.log('Request WebSocket connected')
          setIsRequestConnected(true)
          clearTimeout(timeout)
          resolve()
        }

        requestWsRef.current.socket?.addEventListener('open', handleOpen)
        requestWsRef.current.connect()

        return () => {
          requestWsRef.current.socket?.removeEventListener('open', handleOpen)
        }
      })

      console.log('All WebSocket connections established successfully')

    } catch (error) {
      console.error('Error connecting WebSockets:', error)
      // Don't throw error if messaging is connected but request failed
      if (!isMessagingConnected) {
        toast.error('Failed to establish WebSocket connections')
      } else {
        console.log('Messaging connected but Request connection failed, will retry...')
        // Retry request connection after delay
        setTimeout(() => {
          if (!isRequestConnected) {
            console.log('Retrying Request WebSocket connection...')
            connectWebSockets()
          }
        }, 5000)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // Initialize connections when user is available
  useEffect(() => {
    if (user?.id) {
      connectWebSockets()
    }
    
    return () => {
      messagingWsRef.current.cleanup()
      requestWsRef.current.cleanup()
    }
  }, [user?.id])

  // Reconnection handler
  useEffect(() => {
    const reconnectInterval = setInterval(() => {
      if (user?.id && (!isMessagingConnected || !isRequestConnected) && !isConnecting) {
        console.log('Checking connections and reconnecting if needed...')
        connectWebSockets()
      }
    }, 10000)

    return () => clearInterval(reconnectInterval)
  }, [user?.id, isMessagingConnected, isRequestConnected, isConnecting])

  return (
    <WebSocketContext.Provider value={{
      messagingWs: messagingWsRef.current,
      requestWs: requestWsRef.current,
      isMessagingConnected,
      isRequestConnected
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => useContext(WebSocketContext) 