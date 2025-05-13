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
  const connectionAttemptRef = useRef(0)

  // Sequential connection manager
  const connectWebSockets = async () => {
    // Don't attempt to connect if already connecting or if connections are established
    if (isConnecting || connectionsEstablished) {
      console.log('Already connecting or connections established, skipping connection attempt');
      return;
    }
    
    // Don't connect if both sockets are already connected
    if (isMessagingConnected && isRequestConnected) {
      console.log('Both WebSockets already connected, marking as established');
      setConnectionsEstablished(true);
      return;
    }
    
    setIsConnecting(true);
    connectionAttemptRef.current += 1;
    const currentAttempt = connectionAttemptRef.current;

    try {
      const token = localStorage.getItem("access_token");
      if (!token || !user?.id) {
        throw new Error('No token or user available');
      }

      // First, connect messaging WebSocket if not already connected
      if (!isMessagingConnected) {
        console.log('Initializing Messaging WebSocket connection...');
        
        // Setup disconnect handler
        messagingWsRef.current.onDisconnect(() => {
          if (currentAttempt === connectionAttemptRef.current) {
            setIsMessagingConnected(false);
            setConnectionsEstablished(false);
            console.log('Messaging WebSocket disconnected');
          }
        });
        
        messagingWsRef.current.updateToken(token);
        messagingWsRef.current.setPersistentConnection(true);

        // Check if already connected
        if (messagingWsRef.current.isConnected()) {
          console.log('Messaging WebSocket already connected');
          setIsMessagingConnected(true);
        } else {
          // Connect messaging WebSocket
          try {
            await messagingWsRef.current.connect();
            console.log('Messaging WebSocket connected successfully');
            setIsMessagingConnected(true);
          } catch (error) {
            console.error('Failed to connect messaging WebSocket:', error);
            throw new Error('Messaging connection failed');
          }
        }
      }

      // After messaging is connected, connect request WebSocket if not already connected
      if (!isRequestConnected) {
        console.log('Messaging connection established, initializing Request WebSocket...');
        
        // Setup disconnect handler
        requestWsRef.current.onDisconnect(() => {
          if (currentAttempt === connectionAttemptRef.current) {
            setIsRequestConnected(false);
            setConnectionsEstablished(false);
            console.log('Request WebSocket disconnected');
          }
        });
        
        requestWsRef.current.updateToken(token);
        requestWsRef.current.setPersistentConnection(true);

        // Check if already connected
        if (requestWsRef.current.isConnected()) {
          console.log('Request WebSocket already connected');
          setIsRequestConnected(true);
        } else {
          // Connect request WebSocket
          try {
            await requestWsRef.current.connect();
            console.log('Request WebSocket connected successfully');
            setIsRequestConnected(true);
          } catch (error) {
            console.error('Failed to connect request WebSocket:', error);
            throw new Error('Request connection failed');
          }
        }
      }

      // Mark connections as established when both are connected
      if (isMessagingConnected && isRequestConnected) {
        setConnectionsEstablished(true);
        console.log('All WebSocket connections established successfully');
      }

    } catch (error) {
      console.error('Error connecting WebSockets:', error);
      
      // Don't throw error if messaging is connected but request failed
      if (!isMessagingConnected) {
        toast.error('Failed to establish WebSocket connections');
      } else {
        console.log('Messaging connected but Request connection failed, will retry...');
        // Retry request connection after delay
        setTimeout(() => {
          if (currentAttempt === connectionAttemptRef.current && !isRequestConnected && !isConnecting) {
            console.log('Retrying Request WebSocket connection...');
            setConnectionsEstablished(false);
            connectWebSockets();
          }
        }, 5000);
      }
    } finally {
      if (currentAttempt === connectionAttemptRef.current) {
        setIsConnecting(false);
      }
    }
  }

  // Initialize connections when user is available
  useEffect(() => {
    if (user?.id) {
      // Reset connection state when user changes
      setConnectionsEstablished(false);
      connectWebSockets();
    }
    
    return () => {
      messagingWsRef.current.cleanup();
      requestWsRef.current.cleanup();
      setConnectionsEstablished(false);
    }
  }, [user?.id]);

  // Reconnection handler - only runs if connections are not established
  useEffect(() => {
    const reconnectInterval = setInterval(() => {
      if (user?.id && (!isMessagingConnected || !isRequestConnected) && !isConnecting && !connectionsEstablished) {
        console.log('Checking connections and reconnecting if needed...');
        connectWebSockets();
      }
    }, 10000);

    return () => clearInterval(reconnectInterval);
  }, [user?.id, isMessagingConnected, isRequestConnected, isConnecting, connectionsEstablished]);

  return (
    <WebSocketContext.Provider value={{
      messagingWs: messagingWsRef.current,
      requestWs: requestWsRef.current,
      isMessagingConnected,
      isRequestConnected
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext); 