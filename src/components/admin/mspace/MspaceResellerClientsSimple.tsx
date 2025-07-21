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
import { RefreshCw, Users, AlertCircle, CreditCard, CheckCircle } from "lucide-react";
import { useMspaceAccounts } from "@/hooks/mspace/useMspaceAccounts";
import { ServiceNotice } from "./ServiceNotice";
import { toast } from "sonner";

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

export function MspaceResellerClientsSimple() {
  const [clients, setClients] = useState<ResellerClient[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [credentialsError, setCredentialsError] = useState(false);
  const [showServiceNotice, setShowServiceNotice] = useState(false);
  
  const { 
    queryResellerClients,
    isLoading 
  } = useMspaceAccounts();

  const loadClients = async () => {
    try {
      setCredentialsError(false);
      const data = await queryResellerClients();
      setClients(data);
      setLastUpdated(new Date().toISOString());
      
      if (data.length === 0) {
        toast.info("No reseller clients found for your Mspace account");
      } else {
        toast.success(`✅ Found ${data.length} reseller clients`);
      }
    } catch (error: any) {
      console.error('Failed to load reseller clients:', error);
      if (error.message?.includes('credentials not configured') ||
          error.message?.includes('credentials not found')) {
        setCredentialsError(true);
        toast.error("Please configure your Mspace API credentials first");
      } else if (error.message?.includes('Edge function is currently unavailable')) {
        toast.error("Backend service temporarily unavailable", {
          description: "The reseller clients service is currently being updated. Please try again in a few minutes."
        });
      } else {
        toast.error(`Failed to load reseller clients: ${error.message}`);
      }
    }
  };

  const formatBalance = (balance: string | number | undefined | null) => {
    if (balance === undefined || balance === null || balance === "") {
      return "N/A";
    }

    const numBalance = parseInt(balance.toString());
    if (isNaN(numBalance)) {
      return balance.toString() || "N/A";
    }

    return numBalance.toLocaleString();
  };

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  const getTotalBalance = () => {
    return clients.reduce((total, client) => {
      const balance = parseInt(client.balance) || 0;
      return total + balance;
    }, 0);
  };

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Reseller Clients
          </h2>
          <p className="text-muted-foreground">
            View your reseller client accounts and balances
          </p>
        </div>
        <Button
          onClick={loadClients}
          disabled={isLoading}
          variant="outline"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>

      {credentialsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Mspace API credentials not found. Please configure your credentials in the Admin Users section under API Credentials.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
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
              <CardTitle className="text-sm font-medium">Combined Balance</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatBalance(String(getTotalBalance()))}</div>
              <p className="text-xs text-muted-foreground">
                Total SMS credits
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Success Message */}
      {clients.length > 0 && !credentialsError && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Successfully loaded {clients.length} reseller clients. Your Mspace integration is working correctly.
          </AlertDescription>
        </Alert>
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
              Last updated: {formatLastUpdated(lastUpdated)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {clients.length === 0 && !credentialsError ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {isLoading ? "Loading reseller clients..." : "No reseller clients found"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isLoading 
                  ? "Please wait while we fetch your data..." 
                  : 'Your Mspace account has no reseller clients, or they may not be configured yet.'
                }
              </p>
              {!isLoading && (
                <Button
                  onClick={loadClients}
                  className="mt-4"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          ) : credentialsError ? (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Credentials Required
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Configure your Mspace API credentials to view reseller clients.
              </p>
              <Button
                onClick={loadClients}
                disabled={isLoading}
                className="mt-4"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Retry
              </Button>
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
                  <TableRow key={client.clientname || index}>
                    <TableCell className="font-medium">
                      {client.clientname}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">
                          {formatBalance(client.balance)} SMS
                        </span>
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
          <CardTitle>About Reseller Clients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Reseller clients are sub-accounts under your main Mspace account. This simplified view shows their current SMS balances and status.
          </p>
          <p className="text-sm text-muted-foreground">
            Data is fetched directly from the Mspace API using your configured credentials and refreshed each time you visit this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
