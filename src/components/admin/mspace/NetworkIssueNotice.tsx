import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Wifi, RefreshCw, ExternalLink } from "lucide-react";

interface NetworkIssueNoticeProps {
  error?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  isRetrying?: boolean;
}

export function NetworkIssueNotice({ error, onRetry, onDismiss, isRetrying = false }: NetworkIssueNoticeProps) {
  const isNetworkError = error?.includes('Failed to fetch') || error?.includes('CORS') || error?.includes('network');
  const isEdgeFunctionError = error?.includes('Failed to send a request to the Edge Function');
  
  if (!isNetworkError && !isEdgeFunctionError) {
    return null;
  }

  return (
    <Alert className="border-amber-200 bg-amber-50 mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">
        {isEdgeFunctionError ? 'Backend Service Issues' : 'Network Connectivity Issues'}
      </AlertTitle>
      <AlertDescription className="text-amber-700 space-y-3">
        {isEdgeFunctionError ? (
          <>
            <p>
              The Supabase Edge Functions are currently experiencing issues. This is typically due to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>CORS configuration problems</li>
              <li>Edge function deployment issues</li>
              <li>Environment variable problems</li>
            </ul>
          </>
        ) : (
          <>
            <p>
              Direct API calls to the Mspace service are being blocked. This is typically due to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>CORS policy blocking browser requests</li>
              <li>Network firewall restrictions</li>
              <li>API endpoint accessibility issues</li>
            </ul>
          </>
        )}
        
        <div className="space-y-2">
          <p className="font-medium">Recommended Solutions:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Use the manual input forms in the Credits tab</li>
            <li>Try the API testing tools for external verification</li>
            <li>Check if your network allows external API calls</li>
            <li>Contact your system administrator about firewall settings</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetrying}
              className="border-amber-300 text-amber-800 hover:bg-amber-100"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry Connection
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-800 hover:bg-amber-100"
            onClick={() => {
              // Navigate to credits tab for manual testing
              const tabTrigger = document.querySelector('[value="credits"]') as HTMLButtonElement;
              if (tabTrigger) {
                tabTrigger.click();
              }
            }}
          >
            <Wifi className="h-4 w-4 mr-1" />
            Try Manual Testing
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-800 hover:bg-amber-100"
            onClick={() => window.open('https://api.mspace.co.ke/smsapi/v2/balance', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Check API Status
          </Button>
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-700 hover:bg-amber-100"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
