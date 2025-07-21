import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Zap, 
  Users, 
  CreditCard, 
  Send, 
  Key, 
  User, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useMspaceDirectService } from '@/hooks/mspace/useMspaceDirectService';
import { MspaceCredentials } from '@/services/mspaceDirectApi';

export function MspaceDirectTester() {
  const [manualCredentials, setManualCredentials] = useState<MspaceCredentials>({
    apiKey: '',
    username: '',
    senderId: '',
  });
  const [useManual, setUseManual] = useState(false);
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsMessage, setSmsMessage] = useState('Test message from Mobiwave Direct API');

  // Use stored credentials by default, manual if specified
  const directService = useMspaceDirectService({
    useStoredCredentials: !useManual,
    manualCredentials: useManual ? manualCredentials : undefined,
  });

  const {
    storedCredentials,
    hasCredentials,
    credentialsError,
    checkBalance,
    getResellerClients,
    getSubUsers,
    sendSMS,
    testCredentials,
    isLoading,
    lastResponse,
  } = directService;

  const handleCredentialChange = (field: keyof MspaceCredentials, value: string) => {
    setManualCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isManualCredentialsValid = manualCredentials.apiKey && manualCredentials.username;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Direct API Tester
          </h2>
          <p className="text-muted-foreground">
            Test Mspace API directly, bypassing edge functions
          </p>
        </div>
      </div>

      {/* Credentials Source Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Credentials Source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant={!useManual ? "default" : "outline"}
              onClick={() => setUseManual(false)}
              disabled={!storedCredentials && !credentialsError}
            >
              Use Stored Credentials
            </Button>
            <Button
              variant={useManual ? "default" : "outline"}
              onClick={() => setUseManual(true)}
            >
              Use Manual Input
            </Button>
          </div>

          {!useManual && (
            <div>
              {storedCredentials ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Found stored credentials for username: {storedCredentials.username}
                  </AlertDescription>
                </Alert>
              ) : credentialsError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
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
            </div>
          )}

          {useManual && (
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="manual-apikey">API Key</Label>
                <Input
                  id="manual-apikey"
                  type="password"
                  value={manualCredentials.apiKey}
                  onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                  placeholder="Enter your mspace API key"
                />
              </div>
              <div>
                <Label htmlFor="manual-username">Username</Label>
                <Input
                  id="manual-username"
                  type="text"
                  value={manualCredentials.username}
                  onChange={(e) => handleCredentialChange('username', e.target.value)}
                  placeholder="Enter your mspace username"
                />
              </div>
              <div>
                <Label htmlFor="manual-senderid">Sender ID (Optional)</Label>
                <Input
                  id="manual-senderid"
                  type="text"
                  value={manualCredentials.senderId}
                  onChange={(e) => handleCredentialChange('senderId', e.target.value)}
                  placeholder="Optional sender ID"
                />
              </div>
            </div>
          )}

          {hasCredentials && (
            <Button
              onClick={() => testCredentials.mutate()}
              disabled={isLoading}
              className="w-full"
            >
              {testCredentials.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing Credentials...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Test Credentials
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* API Tests */}
      {hasCredentials && (
        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="clients">Reseller Clients</TabsTrigger>
            <TabsTrigger value="subusers">Sub Users</TabsTrigger>
            <TabsTrigger value="sms">Send SMS</TabsTrigger>
          </TabsList>

          <TabsContent value="balance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Balance Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => checkBalance.mutate()}
                  disabled={isLoading}
                  className="w-full"
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

                {checkBalance.data && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Balance: {checkBalance.data.balance.toLocaleString()} {checkBalance.data.currency}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Reseller Clients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => getResellerClients.mutate()}
                  disabled={isLoading}
                  className="w-full"
                >
                  {getResellerClients.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading Clients...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Get Reseller Clients
                    </>
                  )}
                </Button>

                {getResellerClients.data && getResellerClients.data.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Name</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getResellerClients.data.map((client, index) => (
                        <TableRow key={index}>
                          <TableCell>{client.clientUserName || client.clientname}</TableCell>
                          <TableCell>{client.smsBalance || client.balance} SMS</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {client.status || 'Active'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subusers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Sub Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => getSubUsers.mutate()}
                  disabled={isLoading}
                  className="w-full"
                >
                  {getSubUsers.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading Sub Users...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Get Sub Users
                    </>
                  )}
                </Button>

                {getSubUsers.data && getSubUsers.data.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSubUsers.data.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell>{user.subAccUser}</TableCell>
                          <TableCell>{user.smsBalance} SMS</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {user.status || 'Active'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Test SMS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="sms-recipient">Recipient Phone Number</Label>
                    <Input
                      id="sms-recipient"
                      type="tel"
                      value={smsRecipient}
                      onChange={(e) => setSmsRecipient(e.target.value)}
                      placeholder="e.g., 254700000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sms-message">Message</Label>
                    <Input
                      id="sms-message"
                      type="text"
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder="Enter your test message"
                    />
                  </div>
                </div>

                <Button
                  onClick={() => sendSMS.mutate({ 
                    recipient: smsRecipient, 
                    message: smsMessage 
                  })}
                  disabled={isLoading || !smsRecipient || !smsMessage}
                  className="w-full"
                >
                  {sendSMS.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending SMS...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test SMS
                    </>
                  )}
                </Button>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ This will send a real SMS and consume credits. Use a valid phone number.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Response Display */}
      {lastResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Last API Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium mb-2">
                Operation: {lastResponse.type}
              </div>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(lastResponse.data, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
