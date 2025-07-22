/**
 * Direct Mspace API Service
 * Bypasses Supabase edge functions and makes direct calls to Mspace API
 */

export interface MspaceCredentials {
  apiKey: string;
  username: string;
  senderId?: string;
}

export interface BalanceResponse {
  balance: number;
  currency: string;
  status: string;
  timestamp: string;
  source: 'direct_api';
}

export interface ResellerClient {
  clientUserName?: string;
  clientname?: string;
  smsBalance?: string;
  balance?: string;
  status?: string;
}

export interface SubUser {
  subAccUser: string;
  smsBalance: string;
  status?: string;
}

export interface SendSMSRequest {
  recipient: string;
  message: string;
  senderId?: string;
}

export interface SendSMSResponse {
  status: string;
  messageId?: string;
  balance?: number;
  error?: string;
  timestamp: string;
}

export interface TopUpRequest {
  clientname: string;
  noOfSms: number;
}

export interface TopUpResponse {
  status: string;
  message: string;
  timestamp: string;
}

class MspaceDirectApiService {
  private baseUrl = 'https://api.mspace.co.ke/smsapi/v2';

  private async makeRequest<T>(
    endpoint: string,
    payload: Record<string, any>,
    credentials: MspaceCredentials
  ): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;

    console.log(`Attempting direct API call to: ${url}`, {
      endpoint,
      payload: { ...payload, apikey: '[HIDDEN]' },
      username: credentials.username
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': credentials.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          apikey: credentials.apiKey,
        }),
      });

      const responseText = await response.text();

      console.log(`Mspace API response for ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });

      if (!response.ok) {
        throw new Error(`Mspace API error (${response.status}): ${responseText}`);
      }

      return this.parseResponse<T>(responseText, endpoint);
    } catch (error: any) {
      // Check if this is a CORS or network error (mspace blocks direct browser calls)
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        console.log('Direct API call blocked by CORS, falling back to edge function proxy...');
        return this.makeProxyRequest<T>(endpoint, payload, credentials);
      }
      throw error;
    }
  }

  private async makeProxyRequest<T>(
    endpoint: string,
    payload: Record<string, any>,
    credentials: MspaceCredentials
  ): Promise<T> {
    console.log(`Fallback to edge function proxy for ${endpoint}`);

    // Import supabase client dynamically to avoid circular dependencies
    const { supabase } = await import('@/integrations/supabase/client');

    const { data, error } = await supabase.functions.invoke('mspace-proxy', {
      body: {
        endpoint: `${this.baseUrl}/${endpoint}`,
        apiKey: credentials.apiKey,
        username: credentials.username,
        operation: endpoint,
        ...payload
      }
    });

    if (error) {
      throw new Error(`Edge function proxy failed: ${error.message}`);
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data as T;
  }

  private parseResponse<T>(responseText: string, endpoint: string): T {
    try {
      return JSON.parse(responseText) as T;
    } catch (parseError) {
      // Handle non-JSON responses (like balance endpoint that returns just a number)
      if (endpoint === 'balance') {
        const balance = parseInt(responseText.trim());
        if (isNaN(balance)) {
          throw new Error(`Invalid balance response: ${responseText}`);
        }
        return {
          balance,
          currency: 'SMS',
          status: 'success',
          timestamp: new Date().toISOString(),
          source: 'direct_api'
        } as T;
      }
      
      throw new Error(`Invalid response format for ${endpoint}: ${responseText}`);
    }
  }

  /**
   * Check SMS balance
   */
  async checkBalance(credentials: MspaceCredentials): Promise<BalanceResponse> {
    const result = await this.makeRequest<any>('balance', {}, credentials);
    
    // Normalize response format
    return {
      balance: typeof result === 'number' ? result : (result.balance || parseInt(result.toString())),
      currency: result.currency || 'SMS',
      status: result.status || 'success',
      timestamp: result.timestamp || new Date().toISOString(),
      source: 'direct_api'
    };
  }

  /**
   * Get reseller clients
   */
  async getResellerClients(credentials: MspaceCredentials): Promise<ResellerClient[]> {
    const result = await this.makeRequest<any>('resellerclients', {
      username: credentials.username
    }, credentials);

    // Handle different response formats
    let clients: ResellerClient[] = [];
    
    if (Array.isArray(result)) {
      clients = result;
    } else if (result.resellerClients && Array.isArray(result.resellerClients)) {
      clients = result.resellerClients;
    } else if (result.clients && Array.isArray(result.clients)) {
      clients = result.clients;
    } else {
      console.warn('Unexpected reseller clients response format:', result);
      clients = [];
    }

    // Normalize client data structure
    return clients.map(client => ({
      clientUserName: client.clientUserName || client.clientname,
      clientname: client.clientname || client.clientUserName,
      smsBalance: client.smsBalance || client.balance || '0',
      balance: client.balance || client.smsBalance || '0',
      status: client.status || 'active'
    }));
  }

  /**
   * Get sub users
   */
  async getSubUsers(credentials: MspaceCredentials): Promise<SubUser[]> {
    const result = await this.makeRequest<any>('subusers', {
      username: credentials.username
    }, credentials);

    // Handle different response formats
    if (Array.isArray(result)) {
      return result;
    } else if (result.subUsers && Array.isArray(result.subUsers)) {
      return result.subUsers;
    } else {
      console.warn('Unexpected sub users response format:', result);
      return [];
    }
  }

  /**
   * Send SMS
   */
  async sendSMS(
    credentials: MspaceCredentials,
    request: SendSMSRequest
  ): Promise<SendSMSResponse> {
    const result = await this.makeRequest<any>('sendsms', {
      msisdn: request.recipient,
      message: request.message,
      sender_id: request.senderId || credentials.senderId || credentials.username,
    }, credentials);

    return {
      status: result.status || 'sent',
      messageId: result.messageId || result.id,
      balance: result.balance,
      error: result.error,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Top up reseller client
   */
  async topUpResellerClient(
    credentials: MspaceCredentials,
    request: TopUpRequest
  ): Promise<TopUpResponse> {
    const result = await this.makeRequest<any>('resellerclienttopup', {
      username: credentials.username,
      clientname: request.clientname,
      noOfSms: request.noOfSms,
    }, credentials);

    return {
      status: result.status || 'success',
      message: result.message || `Topped up ${request.noOfSms} SMS to ${request.clientname}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Top up sub account
   */
  async topUpSubAccount(
    credentials: MspaceCredentials,
    request: TopUpRequest
  ): Promise<TopUpResponse> {
    const result = await this.makeRequest<any>('subacctopup', {
      username: credentials.username,
      clientname: request.clientname,
      noOfSms: request.noOfSms,
    }, credentials);

    return {
      status: result.status || 'success',
      message: result.message || `Topped up ${request.noOfSms} SMS to ${request.clientname}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test credentials by making a simple balance check
   */
  async testCredentials(credentials: MspaceCredentials): Promise<boolean> {
    try {
      await this.checkBalance(credentials);
      return true;
    } catch (error) {
      console.error('Credentials test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mspaceDirectApi = new MspaceDirectApiService();

// Export the class for testing or multiple instances
export { MspaceDirectApiService };
