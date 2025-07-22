import { useState } from 'react';
import { toast } from 'sonner';
import { mspaceDirectApi, MspaceCredentials } from '@/services/mspaceDirectApi';
import { supabase } from '@/integrations/supabase/client';

interface SubAccountPayload {
  clientname: string;
  noOfSms: number;
}

interface SubUser {
  smsBalance: string;
  subAccUser: string;
}

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

export const useMspaceAccountsDirect = () => {
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

  const querySubAccounts = async (): Promise<SubUser[]> => {
    setIsLoading(true);
    try {
      const credentials = await getCredentials();
      const result = await mspaceDirectApi.getSubUsers(credentials);
      
      // Convert to expected format
      return result.map(user => ({
        smsBalance: user.smsBalance || '0',
        subAccUser: user.subAccUser || '',
      }));
    } catch (error: any) {
      console.error('Query sub accounts failed:', error);
      toast.error(`Failed to fetch sub accounts: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const queryResellerClients = async (): Promise<ResellerClient[]> => {
    setIsLoading(true);
    try {
      const credentials = await getCredentials();
      const result = await mspaceDirectApi.getResellerClients(credentials);
      
      // Convert to expected format
      return result.map(client => ({
        clientname: client.clientUserName || client.clientname || '',
        balance: client.smsBalance || client.balance || '0',
        status: client.status || 'active'
      }));
    } catch (error: any) {
      console.error('Query reseller clients failed:', error);
      toast.error(`Failed to fetch reseller clients: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const topUpSubAccount = async (payload: SubAccountPayload) => {
    setIsLoading(true);
    try {
      const credentials = await getCredentials();
      const result = await mspaceDirectApi.topUpSubAccount(credentials, payload);
      
      toast.success(`Successfully topped up ${payload.noOfSms} SMS to ${payload.clientname}`);
      return result;
    } catch (error: any) {
      console.error('Top up sub account failed:', error);
      toast.error(`Failed to top up sub account: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const topUpResellerClient = async (payload: SubAccountPayload) => {
    setIsLoading(true);
    try {
      const credentials = await getCredentials();
      const result = await mspaceDirectApi.topUpResellerClient(credentials, payload);
      
      toast.success(`Successfully topped up ${payload.noOfSms} SMS to ${payload.clientname}`);
      return result;
    } catch (error: any) {
      console.error('Top up reseller client failed:', error);
      toast.error(`Failed to top up reseller client: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    querySubAccounts,
    queryResellerClients,
    topUpSubAccount,
    topUpResellerClient,
    isLoading
  };
};
