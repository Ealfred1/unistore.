import { useMessaging } from '@/hooks/useMessaging';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const useStartConversation = () => {
  const { startConversation } = useMessaging(localStorage.getItem("access_token") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startChatWithMerchant = async (merchantId: string, initialMessage?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Start conversation with optional initial message
      const conversationId = await startConversation(merchantId, initialMessage);
      
      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }

      // Redirect to conversation
      window.location.href = `/dashboard/messages?conversation=${conversationId}`;
      
    } catch (error: any) {
      console.error('Failed to start conversation:', error);
      setError('Failed to start conversation. Please try again.');
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { startChatWithMerchant, isLoading, error };
}; 