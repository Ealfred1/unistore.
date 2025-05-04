"use client"

import { createContext, useContext, useEffect, useState, useRef, useMemo } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'
import { WebSocketManager } from '@/utils/websocket'
import { usePathname } from 'next/navigation'

interface Request {
  id: string
  title: string
  description: string
  category_id: string
  category_name: string
  status: string
  created_at: string
  user_id: string
  user_name: string
  university_id: string
  university_name: string
}

interface Offer {
  id: string
  merchant: {
    name: string
    rating: number
    verified: boolean
    image: string
  }
  price: number
  description: string
  created_at: string
}

interface RequestContextType {
  wsInstance: WebSocketManager | null
  isConnected: boolean
  createRequest: (requestData: any) => void
  viewRequest: (requestId: string) => void
  makeOffer: (requestId: string, offerData: any) => void
  acceptOffer: (requestId: string, offerId: string) => void
  currentRequest: Request | null
  requestViews: { [key: string]: number }
  pendingOffers: Array<Offer>
}

const RequestContext = createContext<RequestContextType>({
  wsInstance: null,
  isConnected: false,
  createRequest: () => {},
  viewRequest: () => {},
  makeOffer: () => {},
  acceptOffer: () => {},
  currentRequest: null,
  requestViews: {},
  pendingOffers: []
})

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const wsRef = useRef<WebSocketManager>(WebSocketManager.getInstance())
  const [isConnected, setIsConnected] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null)
  const [requestViews, setRequestViews] = useState<{ [key: string]: number }>({})
  const [pendingOffers, setPendingOffers] = useState<Array<Offer>>([])
  const pathname = usePathname()
  const requestCallbacks = useRef<{ [key: string]: (request: Request) => void }>({})

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?.id) {
      console.log('No user ID found, skipping WS connection')
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      console.log('No token found, skipping WS connection')
      return
    }

    console.log('Initializing Request WebSocket connection...')

    const ws = wsRef.current
    ws.cleanup()
    ws.updateToken(token)
    ws.setPersistentConnection(true)

    const handleConnect = () => {
      console.log('✅ Request WebSocket connected successfully')
      setIsConnected(true)
      
      // Send initialize message after successful connection
      ws.send('initialize', {
        type: 'initialize',
        user_id: user.id,
        university_id: user.university_id
      })
    }

    const handleDisconnect = () => {
      console.log('❌ Request WebSocket disconnected')
      setIsConnected(false)
      toast.error("Lost connection to server. Reconnecting...")
    }

    ws.addMessageHandler('connection_established', handleConnect)
    ws.onDisconnect(handleDisconnect)

    // Connect to requests endpoint
    ws.connect('ws/requests/')

    return () => {
      console.log('Cleaning up Request WebSocket connection...')
      ws.removeMessageHandler('connection_established', handleConnect)
      ws.cleanup()
    }
  }, [user?.id])

  // Handle request views
  useEffect(() => {
    const handleRequestView = (data: any) => {
      const { request_id, views_count } = data
      setRequestViews(prev => ({
        ...prev,
        [request_id]: views_count
      }))

      // Show toast if it's the user's request
      if (currentRequest?.id === request_id) {
        toast(
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-uniOrange/10 flex items-center justify-center">
              👀
            </div>
            <div>
              <p className="font-medium">New View!</p>
              <p className="text-sm text-gray-600">Someone viewed your request</p>
            </div>
          </div>
        )
      }
    }

    wsRef.current.addMessageHandler('request_view', handleRequestView)
    return () => wsRef.current.removeMessageHandler('request_view')
  }, [currentRequest])

  // Handle new offers
  useEffect(() => {
    const handleNewOffer = (data: any) => {
      const { offer, request_id } = data
      setPendingOffers(prev => [...prev, offer])

      // Show toast if it's the user's request
      if (currentRequest?.id === request_id) {
        toast(
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-uniOrange/10 flex items-center justify-center">
              💰
            </div>
            <div>
              <p className="font-medium">New Offer!</p>
              <p className="text-sm text-gray-600">
                {offer.merchant.name} made an offer of ₦{offer.price.toLocaleString()}
              </p>
            </div>
          </div>,
          {
            action: {
              label: "View",
              onClick: () => {
                window.location.href = `/dashboard/requests/${request_id}`
              }
            }
          }
        )
      }
    }

    wsRef.current.addMessageHandler('new_offer', handleNewOffer)
    return () => wsRef.current.removeMessageHandler('new_offer')
  }, [currentRequest])

  // Handle offer acceptance
  useEffect(() => {
    const handleOfferAccepted = (data: any) => {
      const { request_id, offer_id } = data
      
      // Update UI or show notification based on user role
      if (user?.role === 'merchant') {
        toast.success("Your offer was accepted! 🎉")
      }
    }

    wsRef.current.addMessageHandler('offer_accepted', handleOfferAccepted)
    return () => wsRef.current.removeMessageHandler('offer_accepted')
  }, [user])

  // Handle new request creation response
  useEffect(() => {
    const handleRequestCreated = (data: any) => {
      console.log('Received request creation response:', data)
      
      if (data.type === 'request_created' && requestCallbacks.current['pending']) {
        requestCallbacks.current['pending'](data)
        delete requestCallbacks.current['pending']
      }
      
      // Handle new request notifications
      if (data.type === 'new_request' && data.request) {
        if (data.notification_type === 'request_created') {
          setCurrentRequest(data.request)
        }
      }
    }

    wsRef.current.addMessageHandler('request_created', handleRequestCreated)
    wsRef.current.addMessageHandler('new_request', handleRequestCreated)
    
    return () => {
      wsRef.current.removeMessageHandler('request_created')
      wsRef.current.removeMessageHandler('new_request')
    }
  }, [])

  // Provider methods
  const createRequest = (requestData: any): Promise<Request> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current.isConnected()) {
        reject(new Error('WebSocket not connected'))
        return
      }

      try {
        console.log('Sending create request:', requestData)
        
        wsRef.current.send('create_request', {
          type: 'create_request',
          request_data: {
            title: requestData.title,
            description: requestData.description,
            category_id: requestData.category_id
          }
        })

        const timeoutId = setTimeout(() => {
          console.log('Request creation timed out')
          delete requestCallbacks.current['pending']
          reject(new Error('Request creation timeout'))
        }, 10000)

        // Handle both success and error responses
        requestCallbacks.current['pending'] = (response: any) => {
          clearTimeout(timeoutId)
          
          if (response.status === 'error') {
            console.error('Request creation failed:', response.message)
            reject(new Error(response.message))
            return
          }
          
          if (response.status === 'success' && response.request_id) {
            console.log('Request created successfully, ID:', response.request_id)
            // Store the request ID for navigation
            setCurrentRequest({ id: response.request_id } as Request)
            resolve({ id: response.request_id } as Request)
          } else {
            reject(new Error('Invalid response format'))
          }
        }
      } catch (error) {
        console.error('Error sending request:', error)
        reject(error)
      }
    })
  }

  const viewRequest = (requestId: string) => {
    wsRef.current.send('view_request', {
      type: 'view_request',
      request_id: requestId
    })
  }

  const makeOffer = (requestId: string, offerData: any) => {
    wsRef.current.send('make_offer', {
      type: 'make_offer',
      request_id: requestId,
      ...offerData
    })
  }

  const acceptOffer = (requestId: string, offerId: string) => {
    wsRef.current.send('accept_offer', {
      type: 'accept_offer',
      request_id: requestId,
      offer_id: offerId
    })
  }

  const contextValue = useMemo(() => ({
    wsInstance: wsRef.current,
    isConnected,
    createRequest,
    viewRequest,
    makeOffer,
    acceptOffer,
    currentRequest,
    requestViews,
    pendingOffers
  }), [isConnected, currentRequest, requestViews, pendingOffers])

  // Show connection status in UI
  useEffect(() => {
    if (isConnected) {
      toast.success("Connected to server successfully!", {
        duration: 3000
      })
    }
  }, [isConnected])

  return (
    <RequestContext.Provider value={contextValue}>
      {children}
    </RequestContext.Provider>
  )
}

export const useRequest = () => useContext(RequestContext) 