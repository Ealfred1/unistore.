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
  reconnect: () => Promise<void>
}

const WebSocketContext = createContext<WebSocketContextType>({
  messagingWs: null,
  requestWs: null,
  isMessagingConnected: false,
  isRequestConnected: false,
  reconnect: async () => {}
})

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const messagingWsRef = useRef<WebSocketManager>(WebSocketManager.getInstance())
  const requestWsRef = useRef<RequestWebSocketManager>(RequestWebSocketManager.getInstance())
  const [isMessagingConnected, setIsMessagingConnected] = useState(false)
  const [isRequestConnected, setIsRequestConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionAttempted, setConnectionAttempted] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Sequential connection manager
  const connectWebSockets = async () => {
    if (isConnecting) return
    
    if (isMessagingConnected && isRequestConnected) {
      console.log('Both WebSockets already connected, skipping connection attempt')
      return
    }
    
    setIsConnecting(true)
    setConnectionError(null)

    try {
      const token = localStorage.getItem("access_token")
      if (!token || !user?.id) {
        throw new Error('No token or user available')
      }

      if (!isMessagingConnected) {
        console.log('Initializing Messaging WebSocket connection...')
        messagingWsRef.current.updateToken(token)
        messagingWsRef.current.setPersistentConnection(true)
        
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Messaging connection timeout')), 15000)
          
          messagingWsRef.current.onDisconnect(() => {
            setIsMessagingConnected(false)
            console.log('Messaging WebSocket disconnected')
          })

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
          messagingWsRef.current.connect().catch(err => {
            console.error('Error connecting messaging WebSocket:', err)
            clearTimeout(timeout)
            reject(err)
          })

          return () => {
            messagingWsRef.current.socket?.removeEventListener('open', handleOpen)
          }
        })
      }

      console.log('Messaging connection established or already active')

      if (!isRequestConnected) {
        console.log('Initializing Request WebSocket...')
        requestWsRef.current.updateToken(token)
        requestWsRef.current.setPersistentConnection(true)

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Request connection timeout')), 15000)

          requestWsRef.current.onDisconnect(() => {
            setIsRequestConnected(false)
            console.log('Request WebSocket disconnected')
          })

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
          requestWsRef.current.connect().catch(err => {
            console.error('Error connecting request WebSocket:', err)
            clearTimeout(timeout)
            reject(err)
          })

          return () => {
            requestWsRef.current.socket?.removeEventListener('open', handleOpen)
          }
        })
      }

      console.log('All WebSocket connections established successfully')
      setConnectionAttempted(true)

    } catch (error) {
      console.error('Error connecting WebSockets:', error)
      setConnectionError(error instanceof Error ? error.message : 'Unknown connection error')
      
      if (!isMessagingConnected && !isRequestConnected) {
        toast.error('Failed to establish WebSocket connections')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const reconnect = async () => {
    console.log('Forcing WebSocket reconnection...')
    
    messagingWsRef.current.cleanup()
    requestWsRef.current.cleanup()
    
    setIsMessagingConnected(false)
    setIsRequestConnected(false)
    setConnectionAttempted(false)
    
    await connectWebSockets()
  }

  useEffect(() => {
    if (user?.id && !connectionAttempted && !isConnecting) {
      connectWebSockets()
    }
    
    return () => {
      messagingWsRef.current.cleanup()
      requestWsRef.current.cleanup()
    }
  }, [user?.id, connectionAttempted, isConnecting])

  useEffect(() => {
    const reconnectInterval = setInterval(() => {
      if (user?.id && connectionAttempted && !isConnecting) {
        if ((isMessagingConnected === false || isRequestConnected === false)) {
          console.log('Connection lost, attempting reconnection...')
          connectWebSockets()
        }
      }
    }, 30000)

    return () => clearInterval(reconnectInterval)
  }, [user?.id, isMessagingConnected, isRequestConnected, isConnecting, connectionAttempted])

  return (
    <WebSocketContext.Provider value={{
      messagingWs: messagingWsRef.current,
      requestWs: requestWsRef.current,
      isMessagingConnected,
      isRequestConnected,
      reconnect
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = () => useContext(WebSocketContext) 