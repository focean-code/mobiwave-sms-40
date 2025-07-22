import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Key, AlertTriangle, ArrowRight } from "lucide-react";

interface EncryptedCredentialsNoticeProps {
  onSwitchToManual: () => void;
  onDismiss: () => void;
}

export function EncryptedCredentialsNotice({
  onSwitchToManual,
  onDismiss
}: EncryptedCredentialsNoticeProps) {
  return (
    <Alert className="border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">
        Encrypted Credentials Detected
      </AlertTitle>
      <AlertDescription className="text-amber-800 space-y-3">
        <p>
          Your Mspace API credentials are stored in encrypted format for security. 
          The browser cannot decrypt them directly, so you'll need to enter them manually for testing.
        </p>
        
        <div className="space-y-2">
          <p className="font-medium">What you can do:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Switch to manual input mode below and enter your credentials temporarily</li>
            <li>Your encrypted credentials remain safely stored in the database</li>
            <li>Manual input is only used for this session and won't be saved</li>
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={onSwitchToManual}
            variant="outline"
            size="sm"
            className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
          >
            <Key className="h-4 w-4 mr-2" />
            Switch to Manual Input
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            className="text-amber-700 hover:bg-amber-100"
          >
            Dismiss
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
