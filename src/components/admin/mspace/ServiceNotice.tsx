import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Settings } from "lucide-react";

interface ServiceNoticeProps {
  onDismiss?: () => void;
}

export function ServiceNotice({ onDismiss }: ServiceNoticeProps) {
  return (
    <Alert className="border-amber-200 bg-amber-50 mb-6">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">
        Service Update in Progress
      </AlertTitle>
      <AlertDescription className="text-amber-700 space-y-3">
        <p>
          The reseller clients service is currently being updated. You can still test your Mspace integration using the following alternatives:
        </p>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-800 hover:bg-amber-100"
            onClick={() => {
              // Navigate to credits tab which has working manual testing
              const tabTrigger = document.querySelector('[value="credits"]') as HTMLButtonElement;
              if (tabTrigger) {
                tabTrigger.click();
              }
            }}
          >
            <Settings className="h-4 w-4 mr-1" />
            Use Credits Tab Testing
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-800 hover:bg-amber-100"
            onClick={() => {
              // Navigate to sub-users tab which has working functionality
              const tabTrigger = document.querySelector('[value="subusers"]') as HTMLButtonElement;
              if (tabTrigger) {
                tabTrigger.click();
              }
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            Try Sub-Users Tab
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
