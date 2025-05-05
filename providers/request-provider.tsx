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
  pendingRequests: Request[]
  getRequestDetails: (requestId: string) => Request | null
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
  pendingOffers: [],
  pendingRequests: [],
  getRequestDetails: () => null
})

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const wsRef = useRef<WebSocketManager>(WebSocketManager.getInstance())
  const [isConnected, setIsConnected] = useState(false)
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null)
  const [requestViews, setRequestViews] = useState<{ [key: string]: number }>({})
  const [pendingOffers, setPendingOffers] = useState<Array<Offer>>([])
  const [pendingRequests, setPendingRequests] = useState<Request[]>([])
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

  // Handle pending requests message
  useEffect(() => {
    const handlePendingRequests = (data: any) => {
      if (data.type === 'pending_requests' && Array.isArray(data.requests)) {
        console.log('Received pending requests:', data.requests);
        setPendingRequests(data.requests);
      }
    };

    wsRef.current.addMessageHandler('pending_requests', handlePendingRequests);
    return () => wsRef.current.removeMessageHandler('pending_requests');
  }, []);

  // Provider methods
  const createRequest = (requestData: any): Promise<Request> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current.isConnected()) {
        reject(new Error('WebSocket not connected'))
        return
      }

      let hasResolved = false

      try {
        console.log('Sending create request:', requestData)
        
        // Handler for both request_created and new_request messages
        const handleMessage = (data: any) => {
          console.log('Received message in createRequest:', data)
          
          if (hasResolved) return

          // For request_created type
          if (data.type === 'request_created' && data.status === 'success') {
            console.log('Request created successfully with ID:', data.request_id)
            // Find request in pending requests
            const request = pendingRequests.find(r => r.id === data.request_id)
            if (request) {
              hasResolved = true
              resolve(request)
              wsRef.current.removeMessageHandler('request_created', handleMessage)
              wsRef.current.removeMessageHandler('new_request', handleMessage)
            }
          }
          
          // For new_request type with request_created notification
          if (data.type === 'new_request' && data.request) {
            console.log('Full request data received:', data.request)
            hasResolved = true
            resolve(data.request)
            wsRef.current.removeMessageHandler('request_created', handleMessage)
            wsRef.current.removeMessageHandler('new_request', handleMessage)
          }
        }

        wsRef.current.send('create_request', {
          type: 'create_request',
          request_data: {
            title: requestData.title,
            description: requestData.description,
            category_id: requestData.category_id
          }
        })

        // Add handlers for both message types
        wsRef.current.addMessageHandler('request_created', handleMessage)
        wsRef.current.addMessageHandler('new_request', handleMessage)

      } catch (error) {
        console.error('Error sending request:', error)
        reject(error)
      }
    })
  }

  const viewRequest = (requestId: string) => {
    // First try to find the request in pending requests
    const request = pendingRequests.find(r => r.id.toString() === requestId);
    if (request) {
      setCurrentRequest(request);
    }

    // Still send the view_request message to track views
    wsRef.current.send('view_request', {
      type: 'view_request',
      request_id: requestId
    });
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

  // Add a method to get request details
  const getRequestDetails = (requestId: string) => {
    console.log('Getting request details for:', requestId);
    console.log('Current pending requests:', pendingRequests);
    
    // Find request in pending requests
    const request = pendingRequests.find(r => r.id.toString() === requestId);
    
    if (request) {
      console.log('Found request:', request);
      setCurrentRequest(request);
      return request;
    } else {
      console.log('Request not found');
      return null;
    }
  }

  // Update the context value to include getRequestDetails
  const contextValue = useMemo(() => ({
    wsInstance: wsRef.current,
    isConnected,
    createRequest,
    viewRequest,
    makeOffer,
    acceptOffer,
    currentRequest,
    requestViews,
    pendingOffers,
    pendingRequests,
    getRequestDetails
  }), [isConnected, currentRequest, requestViews, pendingOffers, pendingRequests])

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