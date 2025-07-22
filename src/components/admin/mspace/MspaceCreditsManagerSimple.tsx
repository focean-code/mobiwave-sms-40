import React, { useState } from "react";
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
import { RefreshCw, CreditCard, Key, User, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMspaceDirectService } from "@/hooks/mspace/useMspaceDirectService";
import { MspaceCredentials } from "@/services/mspaceDirectApi";
import { MspaceBalanceDirect } from "./MspaceBalanceDirect";
import { MspaceAPITester } from "./MspaceAPITester";
import { EncryptedCredentialsNotice } from "./EncryptedCredentialsNotice";

export function MspaceCreditsManagerSimple() {
  const [useManual, setUseManual] = useState(false);
  const [manualCredentials, setManualCredentials] = useState<MspaceCredentials>({
    apiKey: '',
    username: '',
    senderId: '',
  });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

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

  const balance = checkBalance.data?.balance || null;

  const handleCredentialChange = (field: keyof MspaceCredentials, value: string) => {
    setManualCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckBalance = async () => {
    try {
      await checkBalance.mutateAsync();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Credits Management
          </h2>
          <p className="text-muted-foreground">
            Check your SMS balance via edge function proxy (with direct API fallback)
          </p>
        </div>
      </div>

      {/* Credentials Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Credentials
          </CardTitle>
          <CardDescription>
            Configure your Mspace API credentials to check balance
          </CardDescription>
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
                  <CheckCircle className="h-4 w-4" />
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
                  <Label htmlFor="credits-apikey" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Key
                  </Label>
                  <Input
                    id="credits-apikey"
                    type="password"
                    value={manualCredentials.apiKey}
                    onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                    placeholder="Enter your mspace API key"
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username
                  </Label>
                  <Input
                    id="username"
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

          <Button
            onClick={handleCheckBalance}
            disabled={isLoading || !hasCredentials}
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
                ✅ Balance check successful! Your credentials are working correctly.
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
              Balance Status
            </CardTitle>
            <div
              className={`h-3 w-3 rounded-full ${
                balance === null
                  ? "bg-gray-400"
                  : balance > 1000
                    ? "bg-green-500"
                    : balance > 100
                      ? "bg-yellow-500"
                      : "bg-red-500"
              }`}
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance === null
                ? "Unknown"
                : balance > 1000
                  ? "Good"
                  : balance > 100
                    ? "Low"
                    : "Critical"}
            </div>
            <p className="text-xs text-muted-foreground">
              {balance !== null &&
                balance <= 100 &&
                "Consider topping up your account"}
              {balance !== null &&
                balance > 100 &&
                balance <= 1000 &&
                "Monitor usage closely"}
              {balance !== null &&
                balance > 1000 &&
                "Sufficient credits available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Direct API Balance Checker */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">
          Direct API Balance Checker
        </h3>
        <MspaceBalanceDirect />
      </div>

      {/* API Testing Tools */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">
          Advanced API Testing Tools
        </h3>
        <MspaceAPITester />
      </div>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>Hybrid API Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This component uses Supabase Edge Functions as the primary method to communicate with Mspace API, with automatic fallback to direct API calls when possible.
          </p>
          <p className="text-sm text-muted-foreground">
            Edge functions handle CORS restrictions and provide reliable access to the Mspace API from browser environments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
