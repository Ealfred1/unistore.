import { useState, useEffect } from 'react';
import { useRequest } from '@/providers/request-provider';

export function useRequestDetails(requestId: number) {
  const { wsInstance } = useRequest();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('useRequestDetails - Starting with requestId:', requestId);
    console.log('useRequestDetails - WebSocket instance:', wsInstance);
    
    if (!requestId) {
      console.log('useRequestDetails - No requestId provided, returning');
      return;
    }

    if (!wsInstance) {
      console.log('useRequestDetails - No WebSocket instance available');
      setError('WebSocket not connected');
      setLoading(false);
      return;
    }

    if (!wsInstance.isConnected()) {
      console.log('useRequestDetails - WebSocket not connected');
      setError('WebSocket not connected');
      setLoading(false);
      return;
    }

    console.log('useRequestDetails - Setting loading state to true');
    setLoading(true);
    setError(null);

    // Setup one-time handler for response
    const handler = (data: any) => {
      console.log('useRequestDetails - Received message:', data);
      
      if (data.type === 'request_details') {
        console.log('useRequestDetails - Processing request_details message');
        
        if (data.status === 'success') {
          console.log('useRequestDetails - Success, setting request:', data.request);
          setRequest(data.request);
        } else {
          console.log('useRequestDetails - Error:', data.message);
          setError(data.message || 'Failed to load request details');
        }
        
        console.log('useRequestDetails - Setting loading to false');
        setLoading(false);
        
        console.log('useRequestDetails - Removing message handler');
        wsInstance.removeMessageHandler('request_details', handler);
      }
    };

    console.log('useRequestDetails - Adding message handler for request_details');
    wsInstance.addMessageHandler('request_details', handler);

    // Request the details
    console.log('useRequestDetails - Sending get_request_details message with ID:', requestId);
    wsInstance.send('get_request_details', {
      type: 'get_request_details',
      request_id: requestId
    });
    console.log('useRequestDetails - Message sent');

    // Cleanup
    return () => {
      console.log('useRequestDetails - Cleanup: removing message handler');
      wsInstance.removeMessageHandler('request_details', handler);
    };
  }, [requestId, wsInstance]);

  console.log('useRequestDetails - Returning state:', { request, loading, error });
  return { request, loading, error };
} 