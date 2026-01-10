import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Monitor, Globe, Settings, Info } from "lucide-react";

export function EnvironmentDetector() {
  const [envInfo, setEnvInfo] = useState<any>(null);

  useEffect(() => {
    const detectEnvironment = () => {
      const currentUrl = window.location.href;
      const supabaseUrl = "https://bhnjecmsalnqxgociwuk.supabase.co";
      
      // Check if running locally
      const isLocal = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
      const isLovable = currentUrl.includes('lovable.app');
      const isPreview = currentUrl.includes('preview--');
      
      // Detect Supabase setup
      const isUsingProdSupabase = true; // Always using prod based on client.ts
      
      const info = {
        currentUrl,
        environment: {
          isLocal,
          isLovable,
          isPreview,
          isProd: !isLocal && !isPreview
        },
        supabase: {
          url: supabaseUrl,
          isUsingProd: isUsingProdSupabase,
          expectedLocalUrl: "http://localhost:54321"
        },
        deployment: {
          type: isLocal ? 'local' : isLovable ? 'lovable' : 'production',
          edgeFunctionUrl: `${supabaseUrl}/functions/v1/`,
          expectedLocal: "http://localhost:54321/functions/v1/"
        },
        browser: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled
        }
      };
      
      setEnvInfo(info);
    };

    detectEnvironment();
  }, []);

  if (!envInfo) return null;

  const { environment, supabase, deployment, browser } = envInfo;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Environment Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={environment.isLocal ? "border-blue-200 bg-blue-50" : "border-yellow-200 bg-yellow-50"}>
          <Globe className="h-4 w-4" />
          <AlertTitle>Current Environment: {deployment.type.toUpperCase()}</AlertTitle>
          <AlertDescription>
            {environment.isLocal && (
              <span className="text-blue-800">
                🏠 <strong>Local Development</strong> - If you were running `supabase start` before, 
                that's why the edge functions worked! Local Supabase handles everything automatically.
              </span>
            )}
            {environment.isLovable && !environment.isPreview && (
              <span className="text-green-800">
                🌐 <strong>Lovable Production</strong> - Using production Supabase instance with deployed edge functions.
              </span>
            )}
            {environment.isPreview && (
              <span className="text-yellow-800">
                🔄 <strong>Lovable Preview</strong> - Preview environment using production Supabase.
              </span>
            )}
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Supabase Configuration
            </h4>
            <div className="text-sm space-y-1">
              <div>URL: <code className="text-xs bg-muted px-1 rounded">{supabase.url}</code></div>
              <div>Type: <span className="font-medium">Production Instance</span></div>
              <div>Edge Functions: <code className="text-xs bg-muted px-1 rounded">{deployment.edgeFunctionUrl}</code></div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Deployment Info
            </h4>
            <div className="text-sm space-y-1">
              <div>Current URL: <code className="text-xs bg-muted px-1 rounded break-all">{envInfo.currentUrl}</code></div>
              <div>Browser: <span className="text-xs">{browser.userAgent.split(' ').slice(0, 3).join(' ')}</span></div>
            </div>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>When API calls typically work:</strong>
            <br />• 🏠 <strong>Local with `supabase start`:</strong> Everything works automatically
            <br />• 🌐 <strong>Production:</strong> Requires properly deployed edge functions + environment variables
            <br />• ��� <strong>Manual mode:</strong> Direct API calls (if CORS allows)
            <br />• 🔄 <strong>Hybrid mode:</strong> Smart fallback between edge functions and direct API
          </AlertDescription>
        </Alert>

        {environment.isLocal && (
          <Alert className="border-blue-200 bg-blue-50">
            <Monitor className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>💡 To get working state back:</strong>
              <br />1. Run <code>supabase start</code> in your terminal
              <br />2. Update your client configuration to use <code>http://localhost:54321</code>
              <br />3. Edge functions will work automatically without deployment
            </AlertDescription>
          </Alert>
        )}

        {!environment.isLocal && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Globe className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>🔧 Production troubleshooting:</strong>
              <br />1. Ensure edge functions are deployed to production
              <br />2. Verify all environment variables are set
              <br />3. Check if credentials are properly encrypted in database
              <br />4. Use manual mode as fallback for testing
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
