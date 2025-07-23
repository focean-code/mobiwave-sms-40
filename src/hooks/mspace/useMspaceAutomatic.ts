import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { mspaceDirectApi, MspaceCredentials, BalanceResponse, ResellerClient, SubUser } from '@/services/mspaceDirectApi';

type CredentialStatus = 'loading' | 'ready' | 'encrypted' | 'missing' | 'error';

interface AutomaticServiceState {
  status: CredentialStatus;
  credentials: MspaceCredentials | null;
  error: string | null;
}

export const useMspaceAutomatic = () => {
  const [state, setState] = useState<AutomaticServiceState>({
    status: 'loading',
    credentials: null,
    error: null
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load stored credentials automatically
  useEffect(() => {
    loadStoredCredentials();
  }, []);

  const loadStoredCredentials = async () => {
    try {
      setState(prev => ({ ...prev, status: 'loading', error: null }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState({
          status: 'missing',
          credentials: null,
          error: 'User not authenticated'
        });
        return;
      }

      const { data: credentials, error } = await supabase
        .from('api_credentials')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_name', 'mspace')
        .eq('is_active', true)
        .single();

      if (error || !credentials) {
        setState({
          status: 'missing',
          credentials: null,
          error: 'No Mspace credentials found in database'
        });
        return;
      }

      // Check if credentials are encrypted
      if (credentials.api_key_encrypted && !credentials.api_key) {
        setState({
          status: 'encrypted',
          credentials: null,
          error: 'Credentials are encrypted - manual input required'
        });
        return;
      }

      // Use plain text credentials
      const apiKey = credentials.api_key as string;
      const username = credentials.username as string;
      const senderId = credentials.sender_id as string;

      if (!apiKey || !username) {
        setState({
          status: 'error',
          credentials: null,
          error: 'Invalid credentials format'
        });
        return;
      }

      const mspaceCredentials: MspaceCredentials = {
        apiKey,
        username,
        senderId,
      };

      setState({
        status: 'ready',
        credentials: mspaceCredentials,
        error: null
      });

      console.log('✅ Automatic credentials loaded successfully for:', username);

    } catch (error: any) {
      console.error('Failed to load stored credentials:', error);
      setState({
        status: 'error',
        credentials: null,
        error: error.message || 'Failed to load credentials'
      });
    }
  };

  const checkBalance = async (): Promise<BalanceResponse> => {
    if (!state.credentials) {
      throw new Error('No credentials available');
    }

    setIsLoading(true);
    try {
      console.log('🔄 Checking balance with automatic credentials...');
      const result = await mspaceDirectApi.checkBalance(state.credentials);
      
      toast.success(`✅ Balance: ${result.balance.toLocaleString()} ${result.currency}`, {
        description: 'Automatic direct API call'
      });
      
      return result;
    } catch (error: any) {
      console.error('Automatic balance check failed:', error);
      toast.error(`❌ Balance check failed: ${error.message}`, {
        description: 'Direct API call'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getResellerClients = async (): Promise<ResellerClient[]> => {
    if (!state.credentials) {
      throw new Error('No credentials available');
    }

    setIsLoading(true);
    try {
      console.log('🔄 Fetching reseller clients with automatic credentials...');
      const result = await mspaceDirectApi.getResellerClients(state.credentials);
      
      toast.success(`✅ Found ${result.length} reseller clients`, {
        description: 'Automatic direct API call'
      });
      
      return result;
    } catch (error: any) {
      console.error('Automatic reseller clients fetch failed:', error);
      toast.error(`❌ Failed to fetch reseller clients: ${error.message}`, {
        description: 'Direct API call'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubUsers = async (): Promise<SubUser[]> => {
    if (!state.credentials) {
      throw new Error('No credentials available');
    }

    setIsLoading(true);
    try {
      console.log('🔄 Fetching sub users with automatic credentials...');
      const result = await mspaceDirectApi.getSubUsers(state.credentials);
      
      toast.success(`✅ Found ${result.length} sub users`, {
        description: 'Automatic direct API call'
      });
      
      return result;
    } catch (error: any) {
      console.error('Automatic sub users fetch failed:', error);
      toast.error(`❌ Failed to fetch sub users: ${error.message}`, {
        description: 'Direct API call'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const topUpResellerClient = async (clientname: string, noOfSms: number) => {
    if (!state.credentials) {
      throw new Error('No credentials available');
    }

    setIsLoading(true);
    try {
      console.log('🔄 Topping up reseller client with automatic credentials...');
      const result = await mspaceDirectApi.topUpResellerClient(state.credentials, {
        clientname,
        noOfSms
      });
      
      toast.success(`✅ Topped up ${noOfSms} SMS to ${clientname}`, {
        description: 'Automatic direct API call'
      });
      
      return result;
    } catch (error: any) {
      console.error('Automatic top up failed:', error);
      toast.error(`❌ Failed to top up ${clientname}: ${error.message}`, {
        description: 'Direct API call'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const testCredentials = async (): Promise<boolean> => {
    if (!state.credentials) {
      throw new Error('No credentials available');
    }

    setIsLoading(true);
    try {
      console.log('🔄 Testing automatic credentials...');
      const result = await mspaceDirectApi.testCredentials(state.credentials);
      
      if (result) {
        toast.success('✅ Credentials are valid!', {
          description: 'Automatic direct API test'
        });
      } else {
        toast.error('❌ Credentials are invalid', {
          description: 'Automatic direct API test'
        });
      }
      
      return result;
    } catch (error: any) {
      console.error('Automatic credentials test failed:', error);
      toast.error(`❌ Credentials test failed: ${error.message}`, {
        description: 'Direct API call'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Status
    status: state.status,
    isReady: state.status === 'ready',
    isLoading: state.status === 'loading' || isLoading,
    hasCredentials: !!state.credentials,
    credentials: state.credentials,
    error: state.error,
    
    // Actions
    checkBalance,
    getResellerClients,
    getSubUsers,
    topUpResellerClient,
    testCredentials,
    retryLoad: loadStoredCredentials,
  };
};
