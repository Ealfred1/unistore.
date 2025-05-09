"use client"

import { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'
import { RequestWebSocketManager } from '@/utils/request-socket'
import { usePathname } from 'next/navigation'
import { useWebSocket } from '@/providers/websocket-provider'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  user_type: string
}

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
  status: string
  request_user?: {
    id: string
    name: string
    email: string
    phone?: string
  }
}

interface RequestContextType {
  wsInstance: RequestWebSocketManager | null
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
  const { requestWs, isRequestConnected } = useWebSocket()
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null)
  const [requestViews, setRequestViews] = useState<{ [key: string]: number }>({})
  const [pendingOffers, setPendingOffers] = useState<Array<Offer>>([])
  const [pendingRequests, setPendingRequests] = useState<Request[]>([])
  const pathname = usePathname()
  const requestCallbacks = useRef<{ [key: string]: (request: Request) => void }>({})

  useEffect(() => {
    if (!user?.id || !isRequestConnected || !requestWs) return

    // Add request handlers here
    const handleNewRequest = (data: any) => {
      setPendingRequests(prev => [...prev, data.request]);
    }

    requestWs.addMessageHandler('new_request', handleNewRequest)
    
    return () => {
      requestWs.removeMessageHandler('new_request', handleNewRequest)
    }
  }, [user?.id, isRequestConnected])

  // Handle request views
  useEffect(() => {
    if (!requestWs) return;

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

    requestWs.addMessageHandler('request_view_notification', handleRequestView)
    return () => {
      if (requestWs) {
        requestWs.removeMessageHandler('request_view_notification', handleRequestView)
      }
    }
  }, [currentRequest])

  // Handle new offers
  useEffect(() => {
    if (!requestWs) return;

    const handleNewOffer = (data: any) => {
      const { offer, request_id } = data
      setPendingOffers(prev => [...prev, offer])

      // Show toast notification
      toast(
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-uniOrange/10 flex items-center justify-center">
            💰
          </div>
          <div>
            <p className="font-medium">New Offer!</p>
            <p className="text-sm text-gray-600">
              New offer received for your request
            </p>
          </div>
        </div>
      )
    }

    requestWs.addMessageHandler('offer_notification', handleNewOffer)
    return () => {
      if (requestWs) {
        requestWs.removeMessageHandler('offer_notification', handleNewOffer)
      }
    }
  }, [])

  // Handle offer acceptance
  useEffect(() => {
    if (!requestWs) return;

    const handleOfferAccepted = (data: any) => {
      const { request_id, offer_id, status, request_user } = data
      
      // Update UI or show notification based on user role
      if (user?.user_type === 'MERCHANT') {
        toast.success("Your offer was accepted! 🎉")
      }
    }

    requestWs.addMessageHandler('offer_accepted', handleOfferAccepted)
    return () => {
      if (requestWs) {
        requestWs.removeMessageHandler('offer_accepted')
      }
    }
  }, [user, requestWs])

  // Handle pending requests message
  useEffect(() => {
    if (!requestWs) return;

    const handlePendingRequests = (data: any) => {
      if (data.type === 'pending_requests' && Array.isArray(data.requests)) {
        console.log('Received pending requests:', data.requests);
        setPendingRequests(data.requests);
      }
    };

    requestWs.addMessageHandler('pending_requests', handlePendingRequests);
    return () => {
      if (requestWs) {
        requestWs.removeMessageHandler('pending_requests');
      }
    }
  }, [requestWs]);

  // Add handler functions
  const handleRequestView = useCallback((data: any) => {
    setRequestViews(prev => ({
      ...prev,
      [data.request_id]: data.view_count
    }));
  }, []);

  const handleNewOffer = useCallback((data: any) => {
    setPendingOffers(prev => [...prev, data.offer]);
    toast.success('New offer received! 💰');
  }, []);

  const handleOfferStatusUpdate = useCallback((data: any) => {
    setPendingOffers(prev => 
      prev.map(offer => 
        offer.id === data.offer_id 
          ? { ...offer, status: data.status }
          : offer
      )
    );
  }, []);

  const handleRequestStatusUpdate = useCallback((data: any) => {
    setPendingRequests(prev => 
      prev.map(request => 
        request.id === data.request_id 
          ? { ...request, status: data.status }
          : request
      )
    );
  }, []);

  const handlePendingRequests = useCallback((data: any) => {
    setPendingRequests(data.requests);
  }, []);

  // Provider methods
  const createRequest = (requestData: any): Promise<Request> => {
    return new Promise((resolve, reject) => {
      if (!requestWs || !requestWs.isConnected()) {
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
              if (requestWs) {
                requestWs.removeMessageHandler('request_created', handleMessage)
                requestWs.removeMessageHandler('new_request', handleMessage)
              }
            }
          }
          
          // For new_request type with request_created notification
          if (data.type === 'new_request' && data.request) {
            console.log('Full request data received:', data.request)
            hasResolved = true
            resolve(data.request)
            if (requestWs) {
              requestWs.removeMessageHandler('request_created', handleMessage)
              requestWs.removeMessageHandler('new_request', handleMessage)
            }
          }
        }

        if (requestWs) {
          requestWs.send('create_request', {
            type: 'create_request',
            request_data: {
              title: requestData.title,
              description: requestData.description,
              category_id: requestData.category_id
            }
          })

          // Add handlers for both message types
          requestWs.addMessageHandler('request_created', handleMessage)
          requestWs.addMessageHandler('new_request', handleMessage)
        }

      } catch (error) {
        console.error('Error sending request:', error)
        reject(error)
      }
    })
  }

  const viewRequest = (requestId: string) => {
    if (!requestWs) {
      console.error('WebSocket not connected');
      return;
    }

    // First try to find the request in pending requests
    const request = pendingRequests.find(r => r.id.toString() === requestId);
    if (request) {
      setCurrentRequest(request);
    }

    // Generate a session ID for this view
    const sessionId = Math.random().toString(36).substring(2, 15);

    // Send the track_request_view message to track views
    console.log('Sending track_request_view for request:', requestId);
    requestWs.send('track_request_view', {
      type: 'track_request_view',
      request_id: requestId,
      session_id: sessionId
    });
  }

  const makeOffer = (requestId: string, offerData: any) => {
    if (!requestWs) return;
    
    requestWs.send('create_offer', {
      type: 'create_offer',
      request_id: requestId,
      ...offerData
    })
  }

  const acceptOffer = (requestId: string, offerId: string) => {
    if (!requestWs) return;
    
    requestWs.send('accept_offer', {
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
    wsInstance: requestWs,
    isConnected: isRequestConnected,
    createRequest,
    viewRequest,
    makeOffer,
    acceptOffer,
    currentRequest,
    requestViews,
    pendingOffers,
    pendingRequests,
    getRequestDetails
  }), [isRequestConnected, currentRequest, requestViews, pendingOffers, pendingRequests])

  // Show connection status in UI
  useEffect(() => {
    if (isRequestConnected) {
      toast.success("Connected to server successfully!", {
        duration: 3000
      })
    }
  }, [isRequestConnected])

  return (
    <RequestContext.Provider value={contextValue}>
      {children}
    </RequestContext.Provider>
  )
}

export const useRequest = () => useContext(RequestContext) 