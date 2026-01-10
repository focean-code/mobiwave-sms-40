import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, CheckCircle, AlertTriangle, Copy } from "lucide-react";

export function EdgeFunctionEnvSetter() {
  const [showInstructions, setShowInstructions] = useState(false);

  const envVars = [
    {
      name: "SUPABASE_URL",
      value: "https://bhnjecmsalnqxgociwuk.supabase.co",
      description: "Your Supabase project URL"
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY", 
      value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJobmplY21zYWxucXhnb2Npd3VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgyMDQyNywiZXhwIjoyMDYyMzk2NDI3fQ.vwSjIzVcsvbYUy6ml978U3djmslJwaCd5a-fPG4eW2w",
      description: "Service role key for database access"
    },
    {
      name: "API_KEY_ENCRYPTION_KEY_B64",
      value: "[ALREADY SET]",
      description: "Base64 encryption key for API credentials"
    }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateCommands = () => {
    const commands = envVars
      .filter(env => env.value !== "[ALREADY SET]")
      .map(env => `npx supabase secrets set ${env.name}="${env.value}" --project-ref bhnjecmsalnqxgociwuk`)
      .join('\n');
    
    return commands;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Edge Function Environment Variables
          <Button
            onClick={() => setShowInstructions(!showInstructions)}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            {showInstructions ? 'Hide' : 'Show'} Fix Instructions
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>HTTP 500 Errors Detected</AlertTitle>
          <AlertDescription>
            Edge functions are returning HTTP 500 errors with empty responses. 
            This usually means required environment variables are missing.
          </AlertDescription>
        </Alert>

        {showInstructions && (
          <div className="space-y-4">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                <strong>To fix the HTTP 500 errors, set these environment variables in your Supabase project:</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-medium">Required Environment Variables:</h4>
              
              {envVars.map((env) => (
                <div key={env.name} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-medium">{env.name}</span>
                    {env.value !== "[ALREADY SET]" && (
                      <Button
                        onClick={() => copyToClipboard(env.value)}
                        variant="ghost"
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{env.description}</p>
                  {env.value !== "[ALREADY SET]" ? (
                    <code className="text-xs bg-muted p-1 rounded block break-all">
                      {env.value}
                    </code>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Already configured
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border rounded-lg p-4 bg-muted">
              <h4 className="font-medium mb-2">Complete Setup Commands:</h4>
              <p className="text-xs text-muted-foreground mb-2">
                Run these commands in your terminal to set all required environment variables:
              </p>
              <div className="relative">
                <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
                  <code>{generateCommands()}</code>
                </pre>
                <Button
                  onClick={() => copyToClipboard(generateCommands())}
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Steps to fix:</strong>
                <br />1. Go to your Supabase dashboard → Edge Functions → Secrets
                <br />2. Add the missing environment variables listed above
                <br />3. Or run the commands shown above in your terminal
                <br />4. Test the edge functions again using the debugger
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
