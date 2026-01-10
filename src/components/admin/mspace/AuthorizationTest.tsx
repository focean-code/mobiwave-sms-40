import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, XCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AuthorizationTest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAuthorization = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setTestResult({
          status: 'error',
          message: 'Failed to get session',
          details: sessionError
        });
        return;
      }
      
      if (!session) {
        setTestResult({
          status: 'error',
          message: 'No active session found',
          details: 'User is not logged in'
        });
        return;
      }

      // Test with health-check function that shows auth headers
      console.log('Testing with session token:', session.access_token);
      
      const response = await supabase.functions.invoke('health-check');
      
      setTestResult({
        status: response.error ? 'error' : 'success',
        message: response.error ? 'Health check failed' : 'Health check successful',
        sessionInfo: {
          user_id: session.user?.id,
          email: session.user?.email,
          token_expires: session.expires_at,
          token_length: session.access_token?.length
        },
        response: response.data,
        error: response.error
      });
      
    } catch (error: any) {
      setTestResult({
        status: 'error',
        message: 'Caught exception',
        details: error.message,
        error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Authorization & Session Test
          <Button
            onClick={testAuthorization}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            {isLoading ? 'Testing...' : 'Test Auth'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This test checks if your authentication session is working properly 
            and can make authorized requests to edge functions.
          </AlertDescription>
        </Alert>

        {testResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {testResult.status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">{testResult.message}</span>
            </div>

            {testResult.sessionInfo && (
              <div className="bg-muted p-3 rounded">
                <h4 className="font-medium mb-2">Session Info:</h4>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(testResult.sessionInfo, null, 2)}
                </pre>
              </div>
            )}

            {testResult.response && (
              <div className="bg-green-50 border border-green-200 p-3 rounded">
                <h4 className="font-medium mb-2 text-green-800">Health Check Response:</h4>
                <pre className="text-xs overflow-x-auto text-green-700">
                  {JSON.stringify(testResult.response, null, 2)}
                </pre>
              </div>
            )}

            {testResult.error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded">
                <h4 className="font-medium mb-2 text-red-800">Error Details:</h4>
                <pre className="text-xs overflow-x-auto text-red-700">
                  {JSON.stringify(testResult.error, null, 2)}
                </pre>
              </div>
            )}

            {testResult.details && (
              <div className="bg-gray-50 border p-3 rounded">
                <h4 className="font-medium mb-2">Additional Details:</h4>
                <pre className="text-xs overflow-x-auto">
                  {typeof testResult.details === 'string' 
                    ? testResult.details 
                    : JSON.stringify(testResult.details, null, 2)
                  }
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>What this test checks:</strong>
          <br />• User authentication status
          <br />• Session token validity
          <br />• Authorization header format
          <br />• Edge function basic connectivity
          <br />• Environment variable availability
        </div>
      </CardContent>
    </Card>
  );
}
