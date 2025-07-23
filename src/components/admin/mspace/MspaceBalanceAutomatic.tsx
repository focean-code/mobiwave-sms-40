import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, CreditCard, CheckCircle, AlertCircle, Zap, Database, Key, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMspaceAutomatic } from "@/hooks/mspace/useMspaceAutomatic";

export function MspaceBalanceAutomatic() {
  const [balance, setBalance] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const {
    status,
    isReady,
    isLoading,
    hasCredentials,
    credentials,
    error,
    checkBalance,
    testCredentials,
    retryLoad,
  } = useMspaceAutomatic();

  const handleCheckBalance = async () => {
    try {
      const result = await checkBalance();
      setBalance(result.balance);
      setLastUpdated(new Date().toISOString());
    } catch (error: any) {
      console.error('Balance check failed:', error);
    }
  };

  const handleTestCredentials = async () => {
    try {
      await testCredentials();
    } catch (error: any) {
      console.error('Credentials test failed:', error);
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

  const getStatusDisplay = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />,
          text: 'Loading stored credentials...',
          variant: 'default' as const
        };
      case 'ready':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          text: `✅ Ready with stored credentials for: ${credentials?.username}`,
          variant: 'default' as const
        };
      case 'encrypted':
        return {
          icon: <AlertCircle className="h-4 w-4 text-yellow-500" />,
          text: 'Credentials are encrypted - switch to manual mode',
          variant: 'destructive' as const
        };
      case 'missing':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: 'No stored credentials found',
          variant: 'destructive' as const
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4 text-red-500" />,
          text: `Error: ${error}`,
          variant: 'destructive' as const
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4 text-gray-500" />,
          text: 'Unknown status',
          variant: 'default' as const
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Automatic Balance Checker
          </h2>
          <p className="text-muted-foreground">
            Uses stored credentials with direct API calls (no edge functions)
          </p>
        </div>
      </div>

      {/* Credential Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Stored Credentials Status
          </CardTitle>
          <CardDescription>
            Automatically loaded from your database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={statusDisplay.variant}>
            {statusDisplay.icon}
            <AlertDescription>
              {statusDisplay.text}
            </AlertDescription>
          </Alert>

          {status === 'loading' && (
            <div className="text-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Loading credentials from database...
              </p>
            </div>
          )}

          {(status === 'missing' || status === 'error') && (
            <Button
              onClick={retryLoad}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
          )}

          {status === 'encrypted' && (
            <Alert>
              <AlertDescription>
                Your credentials are encrypted for security. Use the "Manual Input" mode 
                in other tabs to test your integration, or contact admin to set up 
                plain text credentials for automatic mode.
              </AlertDescription>
            </Alert>
          )}

          {isReady && (
            <div className="flex gap-2">
              <Button
                onClick={handleTestCredentials}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Test Credentials
              </Button>
              
              <Button
                onClick={handleCheckBalance}
                disabled={isLoading}
                size="sm"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Check Balance
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Display */}
      {isReady && (
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
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Automatic</div>
              <p className="text-xs text-muted-foreground">
                Direct API calls with stored credentials
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success State */}
      {balance !== null && isReady && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Automatic balance check successful! Your stored credentials are working 
            with direct API calls (no edge functions required).
          </AlertDescription>
        </Alert>
      )}

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>How Automatic Mode Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            🔄 <strong>Automatic credential loading:</strong> Retrieves your stored Mspace credentials from the database
          </p>
          <p className="text-sm text-muted-foreground">
            ⚡ <strong>Direct API calls:</strong> Makes API calls directly to api.mspace.co.ke (same as manual mode that worked before)
          </p>
          <p className="text-sm text-muted-foreground">
            🚫 <strong>No edge functions:</strong> Bypasses edge function issues completely
          </p>
          <p className="text-sm text-muted-foreground">
            🔒 <strong>Plain text only:</strong> Works with plain text credentials. Encrypted credentials require manual input.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
