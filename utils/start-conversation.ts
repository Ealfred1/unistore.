import { useMessaging } from '@/hooks/useMessaging';
import { useState } from 'react';

export const useStartConversation = () => {
  const { startConversation } = useMessaging(localStorage.getItem("access_token") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startChatWithMerchant = async (merchantId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const conversationId = await startConversation(merchantId);
      if (conversationId) {
        window.location.href = `/dashboard/messages?conversation=${conversationId}`;
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError('Failed to start conversation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return { startChatWithMerchant, isLoading, error };
};