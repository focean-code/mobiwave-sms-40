import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Database,
  UserPlus,
  Zap
} from "lucide-react";
import { useMspaceAutomatic } from "@/hooks/mspace/useMspaceAutomatic";

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

export function MspaceResellerClientsAutomatic() {
  const [clients, setClients] = useState<ResellerClient[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const {
    status,
    isReady,
    isLoading,
    hasCredentials,
    credentials,
    error,
    getResellerClients,
    topUpResellerClient,
    retryLoad,
  } = useMspaceAutomatic();

  const loadClients = async () => {
    try {
      const result = await getResellerClients();
      setClients(result);
      setLastUpdated(new Date().toISOString());
    } catch (error: any) {
      console.error('Failed to load reseller clients:', error);
    }
  };

  const handleTopUp = async (clientname: string) => {
    const amount = prompt(`Enter SMS amount to top up for ${clientname}:`);
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      try {
        await topUpResellerClient(clientname, Number(amount));
        // Reload clients to show updated balances
        await loadClients();
      } catch (error: any) {
        console.error('Top-up failed:', error);
      }
    }
  };

  // Auto-load clients when credentials become ready
  useEffect(() => {
    if (isReady) {
      loadClients();
    }
  }, [isReady]);

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
          text: `✅ Ready with credentials for: ${credentials?.username} (auto-decrypted)`,
          variant: 'default' as const
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
            Reseller Clients (Automatic)
          </h2>
          <p className="text-muted-foreground">
            Uses stored credentials with direct API calls (no edge functions)
          </p>
        </div>
        <Button
          onClick={loadClients}
          disabled={!isReady || isLoading}
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
            <Database className="h-5 w-5" />
            Stored Credentials Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={statusDisplay.variant}>
            {statusDisplay.icon}
            <AlertDescription>
              {statusDisplay.text}
            </AlertDescription>
          </Alert>

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
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {isReady && clients.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
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
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Integration</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Automatic</div>
              <p className="text-xs text-muted-foreground">
                Direct API calls
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
          {!isReady ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {status === 'loading' ? 'Loading Credentials' : 'Credentials Required'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {status === 'loading' 
                  ? 'Please wait while we load your stored credentials...'
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
                Making automatic direct API call to Mspace
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>SMS Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTopUp(client.clientname)}
                        disabled={isLoading}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Top Up
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Success State */}
      {clients.length > 0 && isReady && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Successfully loaded {clients.length} reseller clients using automatic 
            stored credentials with direct API calls (no edge functions required).
          </AlertDescription>
        </Alert>
      )}

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle>Automatic Direct API Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            🔄 <strong>Automatic operation:</strong> Retrieves stored credentials and makes direct API calls
          </p>
          <p className="text-sm text-muted-foreground">
            ⚡ <strong>Same as manual mode:</strong> Uses the same direct API approach that worked before
          </p>
          <p className="text-sm text-muted-foreground">
            🚫 <strong>No edge functions:</strong> Completely bypasses edge function issues
          </p>
          <p className="text-sm text-muted-foreground">
            🔓 <strong>Auto-decryption:</strong> Automatically decrypts stored credentials for seamless operation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
