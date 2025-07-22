import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, CreditCard, Key, User, CheckCircle, Shield, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMspaceEdgeFunctions } from "@/hooks/mspace/useMspaceEdgeFunctions";
import { useMspaceDirectService } from "@/hooks/mspace/useMspaceDirectService";
import { MspaceCredentials } from "@/services/mspaceDirectApi";
import { supabase } from "@/integrations/supabase/client";

type CredentialsMode = 'detecting' | 'encrypted' | 'manual' | 'error';

export function MspaceCreditsManagerSmart() {
  const [mode, setMode] = useState<CredentialsMode>('detecting');
  const [balance, setBalance] = useState<number | null>(null);
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

  const handleCheckBalance = async () => {
    try {
      let result;
      if (mode === 'encrypted') {
        result = await edgeFunctions.checkBalance();
      } else if (mode === 'manual') {
        result = await directService.checkBalance.mutateAsync();
      } else {
        throw new Error('Invalid mode for balance check');
      }
      
      setBalance(result.balance);
      setLastUpdated(new Date().toISOString());
    } catch (error: any) {
      console.error('Balance check failed:', error);
    }
  };

  const formatBalance = (balance: number | null) => {
    if (balance === null) return "Not checked";
    return balance.toLocaleString();
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const isLoading = edgeFunctions.isLoading || directService.isLoading;
  const canCheckBalance = mode === 'encrypted' || (mode === 'manual' && manualCredentials.apiKey && manualCredentials.username);

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
            Credits Management
          </h2>
          <p className="text-muted-foreground">
            Check your SMS balance using {mode === 'encrypted' ? 'secure edge functions' : 'manual credentials'}
          </p>
        </div>
      </div>

      {/* Credential Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mode === 'encrypted' ? <Shield className="h-5 w-5" /> : <Key className="h-5 w-5" />}
            Credential Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === 'encrypted' ? (
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Secure Mode:</strong> Your credentials are encrypted and managed server-side.
                All API calls are handled through secure edge functions.
                <Button
                  onClick={detectCredentialsType}
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-green-700 hover:bg-green-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Key className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Manual Mode:</strong> Enter your credentials below for testing.
                  Credentials are used temporarily and not stored.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="smart-apikey" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Key
                  </Label>
                  <Input
                    id="smart-apikey"
                    type="password"
                    value={manualCredentials.apiKey}
                    onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                    placeholder="Enter your mspace API key"
                  />
                </div>
                <div>
                  <Label htmlFor="smart-username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    id="smart-username"
                    type="text"
                    value={manualCredentials.username}
                    onChange={(e) => handleCredentialChange('username', e.target.value)}
                    placeholder="Enter your mspace username"
                  />
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleCheckBalance}
            disabled={isLoading || !canCheckBalance}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking Balance...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check Balance
              </>
            )}
          </Button>

          {balance !== null && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Balance check successful! Your integration is working correctly.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Balance Display */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Balance
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBalance(balance)} SMS
            </div>
            <p className="text-xs text-muted-foreground">
              Last checked: {formatLastUpdated(lastUpdated)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Integration Status
            </CardTitle>
            <div
              className={`h-3 w-3 rounded-full ${
                balance === null
                  ? "bg-gray-400"
                  : mode === 'encrypted'
                    ? "bg-green-500"
                    : "bg-blue-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mode === 'encrypted' ? 'Secure' : mode === 'manual' ? 'Manual' : 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === 'encrypted' && 'Server-side credential management'}
              {mode === 'manual' && 'Direct credential input'}
            </p>
          </CardContent>
        </Card>
      </div>

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
                Your Mspace API credentials are encrypted and stored securely. All API calls
                are processed through Supabase Edge Functions that handle decryption server-side.
              </p>
              <p className="text-sm text-muted-foreground">
                This approach ensures your credentials never leave the server environment
                and provides the highest level of security.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Enter your credentials manually for testing purposes. Credentials are used
                temporarily and are not stored in the database.
              </p>
              <p className="text-sm text-muted-foreground">
                For production use, consider setting up encrypted credential storage
                through the admin panel.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
