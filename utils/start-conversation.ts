import { useMessaging } from '@/hooks/useMessaging';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export const useStartConversation = () => {
  const router = useRouter();
  const { startConversation } = useMessaging(localStorage.getItem("access_token") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startChatWithMerchant = async (merchantId: string, initialMessage?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Starting chat with merchant:', merchantId); // Debug log
      
      // Start conversation with optional initial message
      const conversationId = await startConversation(merchantId, initialMessage);
      
      console.log('Conversation created:', conversationId); // Debug log
      
      if (!conversationId) {
        throw new Error('Failed to create conversation');
      }

      // Navigate to messages page
      router.push(`/dashboard/messages?conversation=${conversationId}`);
      
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