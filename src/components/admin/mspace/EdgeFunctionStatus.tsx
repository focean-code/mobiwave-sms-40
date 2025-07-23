import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FunctionStatus {
  name: string;
  status: 'checking' | 'healthy' | 'error' | 'not_deployed';
  error?: string;
  responseTime?: number;
}

export function EdgeFunctionStatus() {
  const [functions, setFunctions] = useState<FunctionStatus[]>([
    { name: 'mspace-balance', status: 'checking' },
    { name: 'mspace-accounts', status: 'checking' },
    { name: 'mspace-proxy', status: 'checking' }
  ]);
  const [isChecking, setIsChecking] = useState(false);

  const checkFunctionHealth = async (functionName: string): Promise<FunctionStatus> => {
    const startTime = Date.now();
    
    try {
      console.log(`Testing ${functionName}...`);
      
      let response;
      if (functionName === 'mspace-balance') {
        response = await supabase.functions.invoke(functionName);
      } else if (functionName === 'mspace-accounts') {
        response = await supabase.functions.invoke(functionName, {
          body: { operation: 'querysubs' }
        });
      } else {
        response = await supabase.functions.invoke(functionName, {
          body: { endpoint: 'test', apiKey: 'test' }
        });
      }
      
      const responseTime = Date.now() - startTime;
      
      if (response.error) {
        console.error(`${functionName} error:`, response.error);

        // Try to get detailed error information
        let errorDetails = response.error.message || 'Unknown error';
        let statusCode = 'unknown';

        if (response.error.context?.status) {
          statusCode = response.error.context.status;
        }

        if (response.error.context?.body) {
          try {
            const responseBody = typeof response.error.context.body === 'string'
              ? JSON.parse(response.error.context.body)
              : response.error.context.body;
            errorDetails += `\n\nStatus: ${statusCode}\nResponse: ${JSON.stringify(responseBody, null, 2)}`;
          } catch {
            errorDetails += `\n\nStatus: ${statusCode}\nResponse: ${response.error.context.body}`;
          }
        }

        // Check for specific error types
        if (response.error.message?.includes('Failed to send a request to the Edge Function')) {
          return {
            name: functionName,
            status: 'not_deployed',
            error: 'Edge function not deployed or not responding',
            responseTime
          };
        } else if (response.error.message?.includes('non-2xx status code')) {
          return {
            name: functionName,
            status: 'error',
            error: `HTTP ${statusCode} Error: ${errorDetails}`,
            responseTime
          };
        } else {
          return {
            name: functionName,
            status: 'error',
            error: errorDetails,
            responseTime
          };
        }
      }
      
      return {
        name: functionName,
        status: 'healthy',
        responseTime
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        name: functionName,
        status: 'error',
        error: error.message,
        responseTime
      };
    }
  };

  const checkAllFunctions = async () => {
    setIsChecking(true);
    
    // Reset status to checking
    setFunctions(prev => prev.map(f => ({ ...f, status: 'checking' as const })));
    
    try {
      const results = await Promise.all(
        functions.map(f => checkFunctionHealth(f.name))
      );
      
      setFunctions(results);
    } catch (error) {
      console.error('Error checking functions:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAllFunctions();
  }, []);

  const getStatusIcon = (status: FunctionStatus['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'not_deployed':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <RefreshCw className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: FunctionStatus['status']) => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'healthy':
        return 'Healthy';
      case 'error':
        return 'Error';
      case 'not_deployed':
        return 'Not Deployed';
      default:
        return 'Unknown';
    }
  };

  const overallStatus = functions.every(f => f.status === 'healthy') ? 'healthy' :
                      functions.some(f => f.status === 'not_deployed') ? 'not_deployed' : 'error';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Edge Function Status
          <Button
            onClick={checkAllFunctions}
            disabled={isChecking}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {overallStatus === 'not_deployed' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Edge Functions Not Deployed</AlertTitle>
            <AlertDescription>
              Some or all edge functions are not deployed. This will cause "Failed to send a request to the Edge Function" errors.
              <br /><br />
              <strong>To fix this:</strong>
              <br />1. Deploy edge functions using: <code>npx supabase functions deploy [function-name] --project-ref bhnjecmsalnqxgociwuk</code>
              <br />2. Set environment variables: <code>npx supabase secrets set API_KEY_ENCRYPTION_KEY_B64="..." --project-ref bhnjecmsalnqxgociwuk</code>
              <br />3. Refresh this status check
            </AlertDescription>
          </Alert>
        )}

        {overallStatus === 'error' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Edge Function Errors Detected</AlertTitle>
            <AlertDescription>
              One or more edge functions are experiencing errors. Check the details below and fix any deployment or configuration issues.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus === 'healthy' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ All edge functions are healthy and responding normally.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {functions.map((func) => (
            <div key={func.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(func.status)}
                <div>
                  <div className="font-medium">{func.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {getStatusText(func.status)}
                    {func.responseTime && ` (${func.responseTime}ms)`}
                  </div>
                </div>
              </div>
              {func.error && (
                <div className="text-sm text-red-600 max-w-md text-right">
                  {func.error}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>Function Purposes:</strong>
          <br />��� mspace-balance: Check SMS balance with encrypted credentials
          <br />• mspace-accounts: Query reseller clients and sub-users  
          <br />• mspace-proxy: Proxy for direct API calls when needed
        </div>
      </CardContent>
    </Card>
  );
}
