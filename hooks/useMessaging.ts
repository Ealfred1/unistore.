// hooks/useMessaging.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketManager } from '@/utils/websocket';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  attachments?: Array<{
    id: string;
    file_name: string;
    file_url: string;
  }>;
}

interface Merchant {
  id: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  merchant_name?: string;
  university: {
    name: string;
    year: number;
  };
  is_online: boolean;
  last_active: string;
  product_count: number;
  rating: number;
  activity_score: number;
}

interface Conversation {
  id: string;
  other_user: {
    id: string;
    first_name: string;
    last_name: string;
    is_merchant: boolean;
    is_online: boolean;
    profile_image: string;
  };
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  last_activity: string;
}

export function useMessaging(token: string) {
  const wsRef = useRef<WebSocketManager | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [onlineMerchants, setOnlineMerchants] = useState<Merchant[]>([]);
  const [isStartingConversation, setIsStartingConversation] = useState(false);

  useEffect(() => {
    if (!token) return;

    if (!wsRef.current) {
      wsRef.current = new WebSocketManager(token);

      wsRef.current.addMessageHandler('online_merchants', (data) => {
        console.log('Received online merchants:', data);
        setOnlineMerchants(data.merchants || []);
      });

      wsRef.current.addMessageHandler('merchant_status', (data) => {
        if (data.is_online) {
          setOnlineMerchants(prev => {
            const exists = prev.some(m => m.id === data.merchant.id);
            if (!exists) {
              return [...prev, data.merchant];
            }
            return prev.map(m => m.id === data.merchant.id ? data.merchant : m);
          });
        } else {
          setOnlineMerchants(prev => prev.filter(m => m.id !== data.merchant_id));
        }
      });

      wsRef.current.addMessageHandler('merchant_activity', (data) => {
        setOnlineMerchants(prev => {
          const updated = prev.map(m => 
            m.id === data.merchant_id 
              ? {...m, activity_score: data.activity_score, last_active: data.last_active}
              : m
          );
          return updated.sort((a, b) => b.activity_score - a.activity_score).slice(0, 5);
        });
      });

      wsRef.current.addMessageHandler('conversations_list', (data) => {
        setConversations(data.data.conversations);
      });

      wsRef.current.addMessageHandler('messages_list', (data) => {
        setCurrentMessages(data.data.messages);
      });

      wsRef.current.addMessageHandler('new_message', (data) => {
        setCurrentMessages(prev => [...prev, data.message]);
        setConversations(prev => prev.map(conv => 
          conv.id === data.message.conversation_id 
            ? { ...conv, last_message: data.message }
            : conv
        ));
      });

      wsRef.current.addMessageHandler('read_receipt', (data) => {
        setCurrentMessages(prev => 
          prev.map(msg => 
            msg.id <= data.last_read_id ? { ...msg, is_read: true } : msg
          )
        );
      });

      wsRef.current.connect();
      
      wsRef.current.send('get_online_merchants', {});
      wsRef.current.send('get_conversations', { page: 1 });
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [token]);

  const getConversations = useCallback(() => {
    wsRef.current?.send('get_conversations', { page: 1 });
  }, []);

  const getMessages = useCallback((conversationId: string) => {
    wsRef.current?.send('get_messages', { conversation_id: conversationId, page: 1 });
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string, attachments?: File[]) => {
    wsRef.current?.send('send_message', {
      conversation_id: conversationId,
      content,
      attachments
    });
  }, []);

  const markAsRead = useCallback((conversationId: string, messageId: string) => {
    wsRef.current?.send('mark_read', {
      conversation_id: conversationId,
      last_read_id: messageId
    });
  }, []);

  const startConversation = useCallback(async (merchantId: string): Promise<string | undefined> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      setIsStartingConversation(true);

      // Check for existing conversation first
      const existingConv = conversations.find(
        conv => conv.other_user.id === merchantId
      );
      
      if (existingConv) {
        setIsStartingConversation(false);
        resolve(existingConv.id);
        return;
      }

      // Add one-time handlers for the response
      const handleSuccess = (data: any) => {
        setConversations(prev => [data.conversation, ...prev]);
        setIsStartingConversation(false);
        resolve(data.conversation.id);
        wsRef.current?.messageHandlers.delete('conversation_started');
        wsRef.current?.messageHandlers.delete('conversation_error');
      };

      const handleError = (data: any) => {
        setIsStartingConversation(false);
        reject(new Error(data.message));
        wsRef.current?.messageHandlers.delete('conversation_started');
        wsRef.current?.messageHandlers.delete('conversation_error');
      };

      wsRef.current.addMessageHandler('conversation_started', handleSuccess);
      wsRef.current.addMessageHandler('conversation_error', handleError);

      // Send the request
      wsRef.current.send('start_conversation_with_merchant', { merchant_id: merchantId });
    });
  }, [conversations]);

  return {
    conversations,
    currentMessages,
    onlineMerchants,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    startConversation,
    isStartingConversation
  };
}