import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Key,
  Zap
} from 'lucide-react';
import { useMspaceDirectService } from '@/hooks/mspace/useMspaceDirectService';
import { MspaceCredentials } from '@/services/mspaceDirectApi';
import { NetworkIssueNotice } from './NetworkIssueNotice';

export function MspaceBalanceDirect() {
  const [useManual, setUseManual] = useState(false);
  const [manualCredentials, setManualCredentials] = useState<MspaceCredentials>({
    apiKey: '',
    username: '',
    senderId: '',
  });
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [showNetworkNotice, setShowNetworkNotice] = useState(false);

  const directService = useMspaceDirectService({
    useStoredCredentials: !useManual,
    manualCredentials: useManual ? manualCredentials : undefined,
  });

  const {
    storedCredentials,
    hasCredentials,
    credentialsError,
    checkBalance,
    isLoading,
  } = directService;

  const handleCredentialChange = (field: keyof MspaceCredentials, value: string) => {
    setManualCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBalanceCheck = async () => {
    try {
      setNetworkError(null);
      setShowNetworkNotice(false);
      await checkBalance.mutateAsync();
    } catch (error: any) {
      console.error('Balance check failed:', error);

      // Check for network/CORS errors
      if (error.message?.includes('Failed to fetch') ||
          error.message?.includes('CORS') ||
          error.message?.includes('Failed to send a request to the Edge Function')) {
        setNetworkError(error.message);
        setShowNetworkNotice(true);
      }
    }
  };

  const formatBalance = (balance: number | null) => {
    if (balance === null) return "Not checked";
    return balance.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Balance Check (Direct API)
          </h2>
          <p className="text-muted-foreground">
            Check SMS balance using direct API calls
          </p>
        </div>
      </div>

      {/* Network Issue Notice */}
      {showNetworkNotice && (
        <NetworkIssueNotice
          error={networkError}
          onRetry={handleBalanceCheck}
          onDismiss={() => setShowNetworkNotice(false)}
          isRetrying={isLoading}
        />
      )}

      {/* Credentials Source */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={useManual ? "manual" : "stored"} onValueChange={(value) => setUseManual(value === "manual")}>
            <TabsList>
              <TabsTrigger value="stored">Use Stored Credentials</TabsTrigger>
              <TabsTrigger value="manual">Manual Input</TabsTrigger>
            </TabsList>

            <TabsContent value="stored" className="space-y-4">
              {storedCredentials ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Using stored credentials for: {storedCredentials.username}
                  </AlertDescription>
                </Alert>
              ) : credentialsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {credentialsError.message}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <AlertDescription>
                    Loading stored credentials...
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="balance-apikey">API Key</Label>
                  <Input
                    id="balance-apikey"
                    type="password"
                    value={manualCredentials.apiKey}
                    onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                    placeholder="Enter your mspace API key"
                  />
                </div>
                <div>
                  <Label htmlFor="balance-username">Username</Label>
                  <Input
                    id="balance-username"
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Balance Check */}
      {hasCredentials && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Balance Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {checkBalance.data ? (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-600">
                      {formatBalance(checkBalance.data.balance)} SMS
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last checked: {new Date(checkBalance.data.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Source: Direct API ({checkBalance.data.source})
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    Click "Check Balance" to fetch current balance
                  </div>
                )}
              </div>

              <Button
                onClick={() => checkBalance.mutate()}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {checkBalance.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking Balance...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Check Balance
                  </>
                )}
              </Button>

              {checkBalance.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {checkBalance.error.message}
                  </AlertDescription>
                </Alert>
              )}

              {checkBalance.isSuccess && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Balance retrieved successfully via direct API
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* API Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Direct API Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">No CORS Issues</div>
                    <div className="text-sm text-muted-foreground">
                      Bypasses browser security restrictions
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Real-time Data</div>
                    <div className="text-sm text-muted-foreground">
                      Direct connection to Mspace API
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">No Backend Required</div>
                    <div className="text-sm text-muted-foreground">
                      Works without Supabase Edge Functions
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Faster Response</div>
                    <div className="text-sm text-muted-foreground">
                      No intermediate processing layers
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This component makes direct calls to api.mspace.co.ke, bypassing all backend services.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      )}

      {!hasCredentials && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Credentials Required
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure your credentials above to check balance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
