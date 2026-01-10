import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  RefreshCw, 
  Users, 
  AlertCircle, 
  CreditCard, 
  CheckCircle,
  Key,
  User,
  Shield
} from "lucide-react";
import { useMspaceEdgeFunctions } from "@/hooks/mspace/useMspaceEdgeFunctions";
import { useMspaceDirectService } from "@/hooks/mspace/useMspaceDirectService";
import { MspaceCredentials } from "@/services/mspaceDirectApi";
import { supabase } from "@/integrations/supabase/client";

type CredentialsMode = 'detecting' | 'encrypted' | 'manual' | 'error';

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

export function MspaceResellerClientsSmart() {
  const [mode, setMode] = useState<CredentialsMode>('detecting');
  const [clients, setClients] = useState<ResellerClient[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [manualCredentials, setManualCredentials] = useState<MspaceCredentials>({
    apiKey: '',
    username: '',
    senderId: '',
  });

  // Edge functions hook (for encrypted credentials)
  const edgeFunctions = useMspaceEdgeFunctions();
  
  // Direct service hook (for manual credentials)
  const directService = useMspaceDirectService({
    useStoredCredentials: false,
    manualCredentials: mode === 'manual' ? manualCredentials : undefined,
  });

  // Detect credential type on mount
  useEffect(() => {
    detectCredentialsType();
  }, []);

  const detectCredentialsType = async () => {
    setMode('detecting');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMode('manual');
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
        console.log('No stored credentials found, defaulting to manual mode');
        setMode('manual');
        return;
      }

      // Check if credentials are encrypted
      if (credentials.api_key_encrypted && !credentials.api_key) {
        console.log('Encrypted credentials detected, using edge functions');
        setMode('encrypted');
      } else if (credentials.api_key) {
        console.log('Plain text credentials detected, using direct API');
        setMode('manual');
      } else {
        console.log('Invalid credential format, defaulting to manual mode');
        setMode('manual');
      }
    } catch (error) {
      console.error('Error detecting credential type:', error);
      setMode('error');
    }
  };

  const handleCredentialChange = (field: keyof MspaceCredentials, value: string) => {
    setManualCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadClients = async () => {
    try {
      let result;
      if (mode === 'encrypted') {
        result = await edgeFunctions.getResellerClients();
      } else if (mode === 'manual') {
        result = await directService.getResellerClients.mutateAsync();
      } else {
        throw new Error('Invalid mode for loading clients');
      }
      
      setClients(result);
      setLastUpdated(new Date().toISOString());
    } catch (error: any) {
      console.error('Failed to load reseller clients:', error);
    }
  };

  // Auto-load clients when credentials become available
  useEffect(() => {
    if (mode === 'encrypted') {
      loadClients();
    }
  }, [mode]);

  const formatBalance = (balance: string) => {
    const numBalance = parseInt(balance);
    return isNaN(numBalance) ? balance : numBalance.toLocaleString();
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const getTotalBalance = () => {
    return clients.reduce((total, client) => {
      const balance = parseInt(client.balance || '0') || 0;
      return total + balance;
    }, 0);
  };

  const isLoading = edgeFunctions.isLoading || directService.isLoading;
  const canLoadClients = mode === 'encrypted' || (mode === 'manual' && manualCredentials.apiKey && manualCredentials.username);

  if (mode === 'detecting') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Detecting Credential Type
              </h3>
              <p className="text-sm text-gray-500">
                Checking how your Mspace credentials are stored...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'error') {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to detect credential type. Please try refreshing the page or contact support.
            <Button
              onClick={detectCredentialsType}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Detection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Reseller Clients
          </h2>
          <p className="text-muted-foreground">
            View your reseller client accounts using {mode === 'encrypted' ? 'secure edge functions' : 'manual credentials'}
          </p>
        </div>
        <Button
          onClick={loadClients}
          disabled={isLoading || !canLoadClients}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {/* Credential Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mode === 'encrypted' ? <Shield className="h-5 w-5" /> : <Key className="h-5 w-5" />}
            API Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'encrypted' ? (
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Using encrypted credentials managed server-side for secure access.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Key className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Manual credentials required. Enter your Mspace API credentials below.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="clients-apikey">API Key</Label>
                  <Input
                    id="clients-apikey"
                    type="password"
                    value={manualCredentials.apiKey}
                    onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                    placeholder="Enter your mspace API key"
                  />
                </div>
                <div>
                  <Label htmlFor="clients-username">Username</Label>
                  <Input
                    id="clients-username"
                    type="text"
                    value={manualCredentials.username}
                    onChange={(e) => handleCredentialChange('username', e.target.value)}
                    placeholder="Enter your mspace username"
                  />
                </div>
              </div>
              
              {manualCredentials.apiKey && manualCredentials.username && (
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    ✅ Manual credentials ready for: {manualCredentials.username}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {clients.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients.length}</div>
              <p className="text-xs text-muted-foreground">
                Active reseller accounts
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBalance(String(getTotalBalance()))}</div>
              <p className="text-xs text-muted-foreground">
                Combined SMS credits
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clients Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Reseller Clients ({clients.length})
          </CardTitle>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground">
              {mode === 'encrypted' ? 'Secure API' : 'Direct API'} • {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {!canLoadClients ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Credentials Required
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {mode === 'manual' 
                  ? 'Enter your credentials above to load reseller clients.'
                  : 'Configure your credentials to view reseller clients.'
                }
              </p>
            </div>
          ) : clients.length === 0 && !isLoading ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No reseller clients found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your Mspace account has no reseller clients, or they may not be configured yet.
              </p>
              <Button
                onClick={loadClients}
                className="mt-4"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Loading reseller clients...
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {mode === 'encrypted' ? 'Fetching via secure edge function' : 'Making direct API call'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>SMS Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {client.clientname}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        {formatBalance(client.balance)} SMS
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          client.status === "active" || !client.status
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {client.status || "Active"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'encrypted' ? 'Secure Server-Side Integration' : 'Manual Testing Mode'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mode === 'encrypted' ? (
            <>
              <p className="text-sm text-muted-foreground">
                Your reseller client data is fetched using encrypted credentials managed server-side
                through Supabase Edge Functions for maximum security.
              </p>
              <p className="text-sm text-muted-foreground">
                All API calls are processed securely without exposing your credentials to the browser.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Enter your credentials manually for testing purposes. This method uses direct API
                calls with automatic fallback to edge function proxy if needed.
              </p>
              <p className="text-sm text-muted-foreground">
                For production use, consider setting up encrypted credential storage for enhanced security.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
