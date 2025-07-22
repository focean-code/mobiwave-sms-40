import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  User
} from "lucide-react";
import { useMspaceDirectService } from "@/hooks/mspace/useMspaceDirectService";
import { MspaceCredentials } from "@/services/mspaceDirectApi";
import { toast } from "sonner";

export function MspaceResellerClientsSimple() {
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
    getResellerClients,
    isLoading,
  } = directService;

  const clients = getResellerClients.data || [];

  const handleCredentialChange = (field: keyof MspaceCredentials, value: string) => {
    setManualCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadClients = async () => {
    try {
      await getResellerClients.mutateAsync();
      setLastUpdated(new Date().toISOString());
    } catch (error: any) {
      console.error('Failed to load reseller clients:', error);
    }
  };

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
      const balance = parseInt(client.smsBalance || client.balance || '0') || 0;
      return total + balance;
    }, 0);
  };

  // Load clients when credentials become available
  useEffect(() => {
    if (hasCredentials) {
      loadClients();
    }
  }, [hasCredentials]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Reseller Clients
          </h2>
          <p className="text-muted-foreground">
            View your reseller client accounts and balances using direct API calls
          </p>
        </div>
        <Button
          onClick={loadClients}
          disabled={isLoading || !hasCredentials}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

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
                  <Label htmlFor="simple-apikey">API Key</Label>
                  <Input
                    id="simple-apikey"
                    type="password"
                    value={manualCredentials.apiKey}
                    onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                    placeholder="Enter your mspace API key"
                  />
                </div>
                <div>
                  <Label htmlFor="simple-username">Username</Label>
                  <Input
                    id="simple-username"
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

      {/* Summary Cards */}
      {hasCredentials && clients.length > 0 && (
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
              Direct API • {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {!hasCredentials ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Credentials Required
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure your credentials above to load reseller clients.
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
                Making direct API call to Mspace
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
                      {client.clientUserName || client.clientname}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        {formatBalance(client.smsBalance || client.balance || '0')} SMS
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
          <CardTitle>Direct API Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            This component uses direct API calls to the Mspace service, bypassing Supabase Edge Functions completely.
          </p>
          <p className="text-sm text-muted-foreground">
            Data is fetched directly from api.mspace.co.ke and updated in real-time. All operations work without backend dependencies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
