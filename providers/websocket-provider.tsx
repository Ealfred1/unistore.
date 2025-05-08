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
  const [connectionsEstablished, setConnectionsEstablished] = useState(false)

  // Sequential connection manager
  const connectWebSockets = async () => {
    // Don't attempt to connect if already connecting or if connections are established
    if (isConnecting || connectionsEstablished) return
    
    // Don't connect if both sockets are already connected
    if (isMessagingConnected && isRequestConnected) {
      setConnectionsEstablished(true)
      return
    }
    
    setIsConnecting(true)

    try {
      const token = localStorage.getItem("access_token")
      if (!token || !user?.id) {
        throw new Error('No token or user available')
      }

      // First, connect messaging WebSocket if not already connected
      if (!isMessagingConnected) {
        console.log('Initializing Messaging WebSocket connection...')
        messagingWsRef.current.cleanup()
        messagingWsRef.current.updateToken(token)
        messagingWsRef.current.setPersistentConnection(true)
        
        messagingWsRef.current.onDisconnect(() => {
          setIsMessagingConnected(false)
          setConnectionsEstablished(false)
          console.log('Messaging WebSocket disconnected')
        })

        // Wait for messaging connection
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Messaging connection timeout')), 15000)
          
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
          
          // Use the Promise-based connect method
          messagingWsRef.current.connect()
            .then(() => {
              handleOpen()
            })
            .catch(error => {
              console.error('Messaging connection error:', error)
              clearTimeout(timeout)
              reject(error)
            })

          return () => {
            messagingWsRef.current.socket?.removeEventListener('open', handleOpen)
          }
        })
      }

      console.log('Messaging connection established, initializing Request WebSocket...')

      // After messaging is connected, connect request WebSocket if not already connected
      if (!isRequestConnected) {
        requestWsRef.current.cleanup()
        requestWsRef.current.updateToken(token)
        requestWsRef.current.setPersistentConnection(true)

        requestWsRef.current.onDisconnect(() => {
          setIsRequestConnected(false)
          setConnectionsEstablished(false)
          console.log('Request WebSocket disconnected')
        })

        // Wait for request connection
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Request connection timeout')), 15000)

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
          
          // Use the Promise-based connect method
          requestWsRef.current.connect()
            .then(() => {
              handleOpen()
            })
            .catch(error => {
              console.error('Request connection error:', error)
              clearTimeout(timeout)
              reject(error)
            })

          return () => {
            requestWsRef.current.socket?.removeEventListener('open', handleOpen)
          }
        })
      }

      // Mark connections as established when both are connected
      if (isMessagingConnected && isRequestConnected) {
        setConnectionsEstablished(true)
        console.log('All WebSocket connections established successfully')
      }

    } catch (error) {
      console.error('Error connecting WebSockets:', error)
      // Don't throw error if messaging is connected but request failed
      if (!isMessagingConnected) {
        toast.error('Failed to establish WebSocket connections')
      } else {
        console.log('Messaging connected but Request connection failed, will retry...')
        // Retry request connection after delay
        setTimeout(() => {
          if (!isRequestConnected && !isConnecting) {
            console.log('Retrying Request WebSocket connection...')
            setConnectionsEstablished(false)
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
      setConnectionsEstablished(false)
      connectWebSockets()
    }
    
    return () => {
      messagingWsRef.current.cleanup()
      requestWsRef.current.cleanup()
      setConnectionsEstablished(false)
    }
  }, [user?.id])

  // Reconnection handler - only runs if connections are not established
  useEffect(() => {
    const reconnectInterval = setInterval(() => {
      if (user?.id && (!isMessagingConnected || !isRequestConnected) && !isConnecting && !connectionsEstablished) {
        console.log('Checking connections and reconnecting if needed...')
        connectWebSockets()
      }
    }, 10000)

    return () => clearInterval(reconnectInterval)
  }, [user?.id, isMessagingConnected, isRequestConnected, isConnecting, connectionsEstablished])

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