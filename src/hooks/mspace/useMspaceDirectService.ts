import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  mspaceDirectApi, 
  MspaceCredentials, 
  BalanceResponse, 
  ResellerClient, 
  SubUser, 
  SendSMSRequest, 
  TopUpRequest 
} from '@/services/mspaceDirectApi';

interface UseMspaceDirectServiceOptions {
  useStoredCredentials?: boolean;
  manualCredentials?: MspaceCredentials;
}

export const useMspaceDirectService = (options: UseMspaceDirectServiceOptions = {}) => {
  const { useStoredCredentials = true, manualCredentials } = options;
  const [lastResponse, setLastResponse] = useState<any>(null);

  // Query for stored credentials
  const {
    data: storedCredentials,
    isLoading: credentialsLoading,
    error: credentialsError,
    refetch: refetchCredentials,
  } = useQuery({
    queryKey: ['mspace-stored-credentials'],
    queryFn: async (): Promise<MspaceCredentials | null> => {
      if (!useStoredCredentials) return null;

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
    },
    enabled: useStoredCredentials,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get effective credentials (manual override stored)
  const effectiveCredentials = manualCredentials || storedCredentials;
  const hasCredentials = !!effectiveCredentials;

  // Balance check mutation
  const checkBalance = useMutation({
    mutationFn: async (): Promise<BalanceResponse> => {
      if (!effectiveCredentials) {
        throw new Error('No credentials available');
      }
      const result = await mspaceDirectApi.checkBalance(effectiveCredentials);
      setLastResponse({ type: 'balance', data: result });
      return result;
    },
    onSuccess: (data) => {
      const source = data.source === 'direct_api' ? 'direct API' : 'edge function proxy';
      toast.success(`✅ Balance: ${data.balance.toLocaleString()} ${data.currency}`, {
        description: `Retrieved via ${source}`
      });
    },
    onError: (error: any) => {
      console.error('Balance check error:', error);
      toast.error(`❌ Balance check failed: ${error.message}`, {
        description: 'Direct API call'
      });
    },
  });

  // Reseller clients mutation
  const getResellerClients = useMutation({
    mutationFn: async (): Promise<ResellerClient[]> => {
      if (!effectiveCredentials) {
        throw new Error('No credentials available');
      }
      const result = await mspaceDirectApi.getResellerClients(effectiveCredentials);
      setLastResponse({ type: 'resellerClients', data: result });
      return result;
    },
    onSuccess: (data) => {
      toast.success(`✅ Found ${data.length} reseller clients`, {
        description: 'Direct API call'
      });
    },
    onError: (error: any) => {
      console.error('Reseller clients error:', error);
      toast.error(`❌ Failed to fetch reseller clients: ${error.message}`, {
        description: 'Direct API call'
      });
    },
  });

  // Sub users mutation
  const getSubUsers = useMutation({
    mutationFn: async (): Promise<SubUser[]> => {
      if (!effectiveCredentials) {
        throw new Error('No credentials available');
      }
      const result = await mspaceDirectApi.getSubUsers(effectiveCredentials);
      setLastResponse({ type: 'subUsers', data: result });
      return result;
    },
    onSuccess: (data) => {
      toast.success(`✅ Found ${data.length} sub users`, {
        description: 'Retrieved via direct API'
      });
    },
    onError: (error: any) => {
      console.error('Sub users error:', error);
      toast.error(`❌ Failed to fetch sub users: ${error.message}`, {
        description: 'Direct API call'
      });
    },
  });

  // Send SMS mutation
  const sendSMS = useMutation({
    mutationFn: async (request: SendSMSRequest) => {
      if (!effectiveCredentials) {
        throw new Error('No credentials available');
      }
      const result = await mspaceDirectApi.sendSMS(effectiveCredentials, request);
      setLastResponse({ type: 'sendSMS', data: result });
      return result;
    },
    onSuccess: (data, variables) => {
      toast.success(`✅ SMS sent to ${variables.recipient}`, {
        description: data.messageId ? `Message ID: ${data.messageId}` : 'Direct API call'
      });
    },
    onError: (error: any, variables) => {
      console.error('Send SMS error:', error);
      toast.error(`❌ Failed to send SMS to ${variables.recipient}: ${error.message}`, {
        description: 'Direct API call'
      });
    },
  });

  // Top up reseller client mutation
  const topUpResellerClient = useMutation({
    mutationFn: async (request: TopUpRequest) => {
      if (!effectiveCredentials) {
        throw new Error('No credentials available');
      }
      const result = await mspaceDirectApi.topUpResellerClient(effectiveCredentials, request);
      setLastResponse({ type: 'topUpReseller', data: result });
      return result;
    },
    onSuccess: (data, variables) => {
      toast.success(`✅ Topped up ${variables.noOfSms} SMS to ${variables.clientname}`, {
        description: 'Direct API call'
      });
    },
    onError: (error: any, variables) => {
      console.error('Top up reseller client error:', error);
      toast.error(`❌ Failed to top up ${variables.clientname}: ${error.message}`, {
        description: 'Direct API call'
      });
    },
  });

  // Top up sub account mutation
  const topUpSubAccount = useMutation({
    mutationFn: async (request: TopUpRequest) => {
      if (!effectiveCredentials) {
        throw new Error('No credentials available');
      }
      const result = await mspaceDirectApi.topUpSubAccount(effectiveCredentials, request);
      setLastResponse({ type: 'topUpSub', data: result });
      return result;
    },
    onSuccess: (data, variables) => {
      toast.success(`✅ Topped up ${variables.noOfSms} SMS to ${variables.clientname}`, {
        description: 'Direct API call'
      });
    },
    onError: (error: any, variables) => {
      console.error('Top up sub account error:', error);
      toast.error(`❌ Failed to top up ${variables.clientname}: ${error.message}`, {
        description: 'Direct API call'
      });
    },
  });

  // Test credentials mutation
  const testCredentials = useMutation({
    mutationFn: async (credentials?: MspaceCredentials) => {
      const testCreds = credentials || effectiveCredentials;
      if (!testCreds) {
        throw new Error('No credentials to test');
      }
      return await mspaceDirectApi.testCredentials(testCreds);
    },
    onSuccess: (isValid) => {
      if (isValid) {
        toast.success('✅ Credentials are valid!', {
          description: 'Direct API test successful'
        });
      } else {
        toast.error('❌ Credentials are invalid', {
          description: 'Direct API test failed'
        });
      }
    },
    onError: (error: any) => {
      console.error('Credentials test error:', error);
      toast.error(`❌ Credentials test failed: ${error.message}`, {
        description: 'Direct API call'
      });
    },
  });

  return {
    // Credentials
    storedCredentials,
    effectiveCredentials,
    hasCredentials,
    credentialsLoading,
    credentialsError,
    refetchCredentials,

    // API operations
    checkBalance,
    getResellerClients,
    getSubUsers,
    sendSMS,
    topUpResellerClient,
    topUpSubAccount,
    testCredentials,

    // State
    lastResponse,
    
    // Loading states
    isLoading: 
      credentialsLoading ||
      checkBalance.isPending ||
      getResellerClients.isPending ||
      getSubUsers.isPending ||
      sendSMS.isPending ||
      topUpResellerClient.isPending ||
      topUpSubAccount.isPending ||
      testCredentials.isPending,
  };
};
