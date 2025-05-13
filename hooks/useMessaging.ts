// hooks/useMessaging.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketManager } from '@/utils/websocket';
import { useAuth } from '@/providers/auth-provider';
import { usePathname } from '@/hooks/usePathname';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  conversation_id: string;
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
    profile_image: string;
    is_merchant: boolean;
    is_online: boolean;
    merchant_verified?: boolean;
  };
  last_message: Message | null;
  unread_count: number;
  created_at: string;
  last_message_at: string;
}

export function useMessaging(token: string) {
  const { user } = useAuth();
  const pathname = usePathname();
  const wsRef = useRef<WebSocketManager>(WebSocketManager.getInstance());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [onlineMerchants, setOnlineMerchants] = useState<Merchant[]>([]);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  const markAsRead = useCallback((conversationId: string, messageId: string) => {
    wsRef.current?.send('mark_read', {
      conversation_id: conversationId,
      last_read_id: messageId
    });
  }, []);

  const getConversations = useCallback(() => {
    wsRef.current?.send('get_conversations', { page: 1 });
  }, []);

  const getMessages = useCallback((conversationId: string) => {
    wsRef.current?.send('get_messages', { conversation_id: conversationId, page: 1 });
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string, attachments?: File[]) => {
    if (!wsRef.current) return;
    
    wsRef.current.send('send_message', {
      conversation_id: conversationId,
      message: {
        content: content,
        attachments: attachments
      }
    });
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    // Update token instead of creating new instance
    wsRef.current.updateToken(token);

    const handleOnlineMerchants = (data: any) => {
      setOnlineMerchants(data.merchants || []);
    };

    const handleConversationsList = (data: any) => {
      // Fix: Access the nested conversations array correctly
      const conversationsData = data.data?.conversations?.conversations || [];
      console.log('Setting conversations:', conversationsData);
      setConversations(conversationsData);
    };

    // Add handlers
    wsRef.current.addMessageHandler('online_merchants', handleOnlineMerchants);
    wsRef.current.addMessageHandler('conversations_list', handleConversationsList);

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

    wsRef.current.addMessageHandler('messages_list', (data) => {
      // Messages come with is_read status from the server
      const messages = data.data.messages.map((msg: Message) => ({
        ...msg,
        is_read: Boolean(msg.is_read) // Ensure boolean value
      }));
      setCurrentMessages(messages);
    });

    wsRef.current.addMessageHandler('new_message', (data) => {
      const newMessage = data.message;
      
      setCurrentMessages(prev => {
        if (prev.some(msg => String(msg.id) === String(newMessage.id))) {
          return prev;
        }
        return [...prev, { ...newMessage, is_read: false }].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
      
      // Update conversations list with new message
      setConversations(prev => prev.map(conv => 
        String(conv.id) === String(newMessage.conversation_id)
          ? { 
              ...conv, 
              last_message: newMessage, 
              last_message_at: newMessage.created_at,
              unread_count: String(newMessage.sender_id) !== String(user?.id)
                ? conv.unread_count + 1 
                : conv.unread_count
            }
          : conv
      ));
    });

    wsRef.current.addMessageHandler('read_receipt', (data) => {
      const { conversation_id, last_read_id, user_id: readByUserId } = data;
      console.log('Read receipt received:', {
        readByUserId,
        currentUserId: user?.id,
        conversation_id,
        last_read_id
      });
      
      // Update read status for messages sent by current user
      setCurrentMessages(prev => 
        prev.map(msg => ({
          ...msg,
          is_read: String(msg.conversation_id) === String(conversation_id) &&
                   String(msg.sender_id) === String(user?.id) && // Only for messages sent by current user
                   String(msg.id) <= String(last_read_id)
            ? true 
            : msg.is_read
        }))
      );
    });

    return () => {
      wsRef.current.removeMessageHandler('online_merchants', handleOnlineMerchants);
      wsRef.current.removeMessageHandler('conversations_list', handleConversationsList);
    };
  }, [token, user]);

  useEffect(() => {
    if (
      pathname.startsWith('/dashboard/messages') && // Only on messages page
      currentConversation?.id && 
      currentMessages.length > 0
    ) {
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (
        user && 
        lastMessage.sender_id !== user.id && 
        !lastMessage.is_read
      ) {
        // Only mark as read if we're actually viewing this conversation
        const urlParams = new URLSearchParams(window.location.search);
        const activeConversationId = urlParams.get('conversation');
        
        if (activeConversationId === currentConversation.id) {
          markAsRead(currentConversation.id, lastMessage.id);
        }
      }
    }
  }, [
    pathname,
    currentConversation?.id, 
    currentMessages, 
    markAsRead, 
    user
  ]);

  const startConversation = useCallback(async (merchantId: string): Promise<string> => {
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
        setCurrentConversation(existingConv);
        setIsStartingConversation(false);
        resolve(existingConv.id);
        return;
      }

      // Setup handlers before sending the request
      const handleSuccess = (data: any) => {
        if (data.conversation) {
          const newConversation = data.conversation;
          setConversations(prev => [newConversation, ...prev]);
          setCurrentConversation(newConversation);
          setIsStartingConversation(false);
          
          // Send initial message if provided
          if (wsRef.current && newConversation.id && window.initialMessage) {
            wsRef.current.send('send_message', {
              conversation_id: newConversation.id,
              message: {
                content: window.initialMessage
              }
            });
            delete window.initialMessage; // Clear the initial message
          }
          
          resolve(newConversation.id);
        }
        wsRef.current?.removeMessageHandler('conversation_started');
        wsRef.current?.removeMessageHandler('conversation_error');
      };

      const handleError = (data: any) => {
        setIsStartingConversation(false);
        const errorMessage = data.message || 'Could not start conversation';
        reject(new Error(errorMessage));
        wsRef.current?.removeMessageHandler('conversation_started');
        wsRef.current?.removeMessageHandler('conversation_error');
      };

      wsRef.current.addMessageHandler('conversation_started', handleSuccess);
      wsRef.current.addMessageHandler('conversation_error', handleError);

      // Send the request to start conversation
      wsRef.current.send('start_conversation_with_merchant', { merchant_id: merchantId });
    });
  }, [conversations]);

  return {
    conversations,
    currentMessages,
    onlineMerchants,
    currentConversation,
    getConversations,
    getMessages,
    sendMessage,
    markAsRead,
    startConversation,
    isStartingConversation,
    setConversations,
    setOnlineMerchants
  };
}