import { useState } from "react";
import { toast } from "sonner";
import { mspaceDirectApi, MspaceCredentials, BalanceResponse } from "@/services/mspaceDirectApi";
import { supabase } from "@/integrations/supabase/client";

export const useMspaceBalanceDirect = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getCredentials = async (): Promise<MspaceCredentials> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: credentials, error } = await supabase
      .from('api_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('service_name', 'mspace')
      .eq('is_active', true)
      .single();

    if (error || !credentials) {
      throw new Error('Mspace credentials not configured');
    }

    // Handle encrypted credentials
    if (credentials.api_key_encrypted && !credentials.api_key) {
      throw new Error('Encrypted credentials detected. Please use manual input.');
    }

    const apiKey = credentials.api_key as string;
    const username = credentials.username as string;
    const senderId = credentials.sender_id as string;

    if (!apiKey || !username) {
      throw new Error('Invalid credentials format');
    }

    return {
      apiKey,
      username,
      senderId,
    };
  };

  const checkBalance = async (): Promise<BalanceResponse> => {
    setIsLoading(true);

    try {
      console.log("Checking SMS balance via direct API...");

      const credentials = await getCredentials();
      const result = await mspaceDirectApi.checkBalance(credentials);

      console.log("Balance check successful:", result);
      
      toast.success(`✅ Balance: ${result.balance.toLocaleString()} ${result.currency}`, {
        description: 'Direct API call'
      });

      return result;
    } catch (error: any) {
      console.error("Balance check error:", error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`❌ Balance check failed: ${errorMessage}`, {
        description: 'Direct API call'
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkBalance,
    isLoading,
  };
};
