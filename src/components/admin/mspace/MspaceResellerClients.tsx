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
import { RefreshCw, Users, AlertCircle, CreditCard, UserPlus } from "lucide-react";
import { useMspaceAccounts } from "@/hooks/mspace/useMspaceAccounts";
import { ServiceNotice } from "./ServiceNotice";
import { toast } from "sonner";

interface ResellerClient {
  clientname: string;
  balance: string;
  status?: string;
}

export function MspaceResellerClients() {
  const [clients, setClients] = useState<ResellerClient[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [credentialsError, setCredentialsError] = useState(false);
  const [showServiceNotice, setShowServiceNotice] = useState(false);
  
  const { 
    queryResellerClients,
    topUpResellerClient,
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
      } else if (error.message?.includes('Edge function is currently unavailable') ||
                 error.message?.includes('Primary service unavailable')) {
        setShowServiceNotice(true);
        toast.error("Backend service temporarily unavailable", {
          description: "Please see the notice above for alternative testing options."
        });
      } else {
        toast.error(`Failed to load reseller clients: ${error.message}`);
      }
    }
  };

  const handleTopUp = async (clientname: string, amount: number) => {
    try {
      await topUpResellerClient({
        clientname,
        noOfSms: amount
      });
      
      toast.success(`✅ Successfully topped up ${amount} SMS to ${clientname}`);
      
      // Reload clients to show updated balances
      await loadClients();
    } catch (error: any) {
      console.error('Top-up failed:', error);
      toast.error(`Failed to top up ${clientname}: ${error.message}`);
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
      const balance = parseInt(client.balance) || 0;
      return total + balance;
    }, 0);
  };

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  if (credentialsError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Reseller Clients
          </h2>
          <p className="text-muted-foreground">
            View and manage your reseller client accounts
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Mspace API credentials not found. Please configure your credentials in the Admin Users section under API Credentials.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
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
          </CardContent>
        </Card>
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
            View and manage your reseller client accounts
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

      {showServiceNotice && (
        <ServiceNotice onDismiss={() => setShowServiceNotice(false)} />
      )}

      {/* Summary Cards */}
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
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">{formatLastUpdated(lastUpdated)}</div>
            <p className="text-xs text-muted-foreground">
              Data refresh time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Reseller Clients ({clients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No reseller clients found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isLoading 
                  ? "Loading reseller clients..." 
                  : 'Click "Refresh" to fetch your reseller clients.'
                }
              </p>
              {!isLoading && (
                <Button
                  onClick={loadClients}
                  className="mt-4"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Clients
                </Button>
              )}
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
                  <TableRow key={client.clientname || index}>
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
                        onClick={() => {
                          const amount = prompt(`Enter SMS amount to top up for ${client.clientname}:`);
                          if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
                            handleTopUp(client.clientname, Number(amount));
                          }
                        }}
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

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Reseller Clients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Reseller clients are sub-accounts under your main Mspace account. You can monitor their SMS balances and top them up as needed.
          </p>
          <p className="text-sm text-muted-foreground">
            This data is fetched directly from the Mspace API using your configured credentials. The balance and status information is updated in real-time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
