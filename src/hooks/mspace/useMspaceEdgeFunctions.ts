import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BalanceResponse {
  balance: number;
  currency: string;
  status: string;
  timestamp: string;
}

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

interface SubUser {
  smsBalance: string;
  subAccUser: string;
}

export const useMspaceEdgeFunctions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const checkBalance = async (): Promise<BalanceResponse> => {
    setIsLoading(true);
    try {
      console.log('Checking balance via edge function...');
      
      const { data, error } = await supabase.functions.invoke('mspace-balance');

      if (error) {
        console.error('Balance check error:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusCode: error.statusCode,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // Provide more specific error messages
        if (error.message?.includes('Failed to send a request to the Edge Function')) {
          throw new Error(`Edge function 'mspace-balance' is not responding. This usually means:\n1. Edge function not deployed\n2. Environment variables missing (API_KEY_ENCRYPTION_KEY_B64)\n3. Authentication issues\n\nOriginal error: ${error.message}`);
        }

        throw new Error(error.message || 'Failed to check balance');
      }
      
      if (!data || typeof data.balance === 'undefined') {
        throw new Error('Invalid balance response from server');
      }
      
      console.log('Balance check successful:', data);
      
      toast.success(`✅ Balance: ${data.balance.toLocaleString()} ${data.currency || 'SMS'}`, {
        description: 'Retrieved via secure edge function'
      });
      
      return data;
    } catch (error: any) {
      console.error('Balance check failed:', error);
      toast.error(`❌ Balance check failed: ${error.message}`, {
        description: 'Edge function error'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getResellerClients = async (): Promise<ResellerClient[]> => {
    setIsLoading(true);
    try {
      console.log('Fetching reseller clients via edge function...');
      
      const { data, error } = await supabase.functions.invoke('mspace-accounts', {
        body: { operation: 'queryresellerclients' }
      });

      if (error) {
        console.error('Reseller clients error:', error);
        console.error('Full error object:', JSON.stringify(error, null, 2));

        // Try to get more details from the error
        let errorDetails = '';
        let statusCode = 'unknown';

        if (error.context?.status) {
          statusCode = error.context.status;
        }

        if (error.context?.body) {
          try {
            const responseBody = typeof error.context.body === 'string'
              ? JSON.parse(error.context.body)
              : error.context.body;
            errorDetails = JSON.stringify(responseBody, null, 2);
          } catch {
            errorDetails = error.context.body;
          }
        }

        console.error('Response details:', {
          statusCode,
          errorDetails,
          fullContext: error.context
        });

        // Provide more specific error messages based on status code
        if (error.message?.includes('non-2xx status code')) {
          throw new Error(`Edge function 'mspace-accounts' returned error (${statusCode}):\n${errorDetails || error.message}\n\nThis usually indicates:\n1. Authentication issues\n2. Missing/invalid credentials\n3. Mspace API errors\n4. Missing environment variables`);
        }

        if (error.message?.includes('Failed to send a request to the Edge Function')) {
          throw new Error(`Edge function 'mspace-accounts' is not responding. This usually means:\n1. Edge function not deployed\n2. Environment variables missing\n3. Authentication issues\n\nOriginal error: ${error.message}`);
        }

        throw new Error(`${error.message}${errorDetails ? `\n\nResponse: ${errorDetails}` : ''}`);
      }
      
      // Handle different response formats
      let clients: ResellerClient[] = [];
      
      if (Array.isArray(data)) {
        clients = data;
      } else if (data?.resellerClients && Array.isArray(data.resellerClients)) {
        clients = data.resellerClients;
      } else if (data?.clients && Array.isArray(data.clients)) {
        clients = data.clients;
      } else {
        console.warn('Unexpected reseller clients response format:', data);
        clients = [];
      }
      
      // Normalize client data
      const normalizedClients = clients.map(client => ({
        clientname: client.clientUserName || client.clientname || '',
        balance: client.smsBalance || client.balance || '0',
        status: client.status || 'active'
      })).filter(client => client.clientname);
      
      console.log('Reseller clients fetched successfully:', normalizedClients);
      
      toast.success(`✅ Found ${normalizedClients.length} reseller clients`, {
        description: 'Retrieved via secure edge function'
      });
      
      return normalizedClients;
    } catch (error: any) {
      console.error('Reseller clients fetch failed:', error);
      toast.error(`❌ Failed to fetch reseller clients: ${error.message}`, {
        description: 'Edge function error'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubUsers = async (): Promise<SubUser[]> => {
    setIsLoading(true);
    try {
      console.log('Fetching sub users via edge function...');
      
      const { data, error } = await supabase.functions.invoke('mspace-accounts', {
        body: { operation: 'querysubs' }
      });
      
      if (error) {
        console.error('Sub users error:', error);
        throw new Error(error.message || 'Failed to fetch sub users');
      }
      
      const subUsers = data?.subUsers || [];
      
      console.log('Sub users fetched successfully:', subUsers);
      
      toast.success(`✅ Found ${subUsers.length} sub users`, {
        description: 'Retrieved via secure edge function'
      });
      
      return subUsers;
    } catch (error: any) {
      console.error('Sub users fetch failed:', error);
      toast.error(`❌ Failed to fetch sub users: ${error.message}`, {
        description: 'Edge function error'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkBalance,
    getResellerClients,
    getSubUsers,
    isLoading
  };
};
