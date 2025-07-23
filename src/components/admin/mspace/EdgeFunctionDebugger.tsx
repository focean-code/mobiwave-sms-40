import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Bug, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DebugResult {
  function: string;
  status: 'success' | 'error';
  response?: any;
  error?: any;
  statusCode?: number;
  headers?: any;
}

export function EdgeFunctionDebugger() {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);

  const debugFunction = async (functionName: string, body?: any): Promise<DebugResult> => {
    try {
      console.log(`Debugging ${functionName} with body:`, body);
      
      const response = await supabase.functions.invoke(functionName, body ? { body } : undefined);
      
      console.log(`${functionName} response:`, response);
      
      if (response.error) {
        return {
          function: functionName,
          status: 'error',
          error: response.error,
          statusCode: response.error.context?.status || 'unknown',
          headers: response.error.context?.headers
        };
      }
      
      return {
        function: functionName,
        status: 'success',
        response: response.data
      };
    } catch (error: any) {
      console.error(`${functionName} caught error:`, error);
      return {
        function: functionName,
        status: 'error',
        error: error.message || error,
        statusCode: 'exception'
      };
    }
  };

  const runAllDebugTests = async () => {
    setIsDebugging(true);
    setResults([]);
    
    const tests = [
      { name: 'health-check', body: undefined },
      { name: 'mspace-balance', body: undefined },
      { name: 'mspace-accounts', body: { operation: 'querysubs' } },
      { name: 'mspace-accounts', body: { operation: 'queryresellerclients' } },
      { name: 'mspace-proxy', body: { endpoint: 'test', apiKey: 'test' } }
    ];
    
    const debugResults: DebugResult[] = [];
    
    for (const test of tests) {
      const result = await debugFunction(test.name, test.body);
      debugResults.push(result);
      setResults([...debugResults]); // Update UI as we go
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between tests
    }
    
    setIsDebugging(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Edge Function Response Debugger
          <Button
            onClick={runAllDebugTests}
            disabled={isDebugging}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isDebugging ? 'animate-spin' : ''}`} />
            {isDebugging ? 'Debugging...' : 'Run Debug Tests'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Bug className="h-4 w-4" />
          <AlertDescription>
            This tool tests each edge function and captures the full response details, 
            including error messages, status codes, and response bodies to help diagnose issues.
          </AlertDescription>
        </Alert>
        
        {results.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">Debug Results:</h4>
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {result.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{result.function}</span>
                  {result.statusCode && (
                    <span className="text-sm text-muted-foreground">
                      (Status: {result.statusCode})
                    </span>
                  )}
                </div>
                
                {result.status === 'success' ? (
                  <div>
                    <p className="text-sm text-green-600 mb-2">✅ Success</p>
                    <Textarea
                      value={JSON.stringify(result.response, null, 2)}
                      readOnly
                      className="font-mono text-xs h-32"
                    />
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-red-600 mb-2">❌ Error</p>
                    <Textarea
                      value={JSON.stringify(result.error, null, 2)}
                      readOnly
                      className="font-mono text-xs h-32 border-red-200"
                    />
                    {result.headers && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">Headers:</p>
                        <Textarea
                          value={JSON.stringify(result.headers, null, 2)}
                          readOnly
                          className="font-mono text-xs h-20"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {isDebugging && (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Running debug tests... ({results.length}/4 completed)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
