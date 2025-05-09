import { useMessaging } from '@/hooks/useMessaging';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export const useStartConversation = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only access localStorage on the client side
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") || "" : "";
  const { startConversation } = useMessaging(token);

  const startChatWithMerchant = async (merchantId: string, initialMessage?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log('Starting chat with merchant:', merchantId); // Debug log
      
      // Start conversation with the merchant ID
      const conversationId = await startConversation(merchantId);
      
      console.log('Conversation created:', conversationId); // Debug log
      
      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }

      // Navigate to messages page with initial message as query param if provided
      const url = initialMessage 
        ? `/dashboard/messages?conversation=${conversationId}&message=${encodeURIComponent(initialMessage)}`
        : `/dashboard/messages?conversation=${conversationId}`;
        
      router.push(url);
      
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      setError('Failed to start conversation. Please try again.');
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { startChatWithMerchant, isLoading, error };
}; 