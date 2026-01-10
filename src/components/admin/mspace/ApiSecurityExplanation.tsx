import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  Database, 
  Server, 
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";

export function ApiSecurityExplanation() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          API Credentials Security
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            {showDetails ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Show Security Details
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Secure by Default</AlertTitle>
          <AlertDescription className="text-green-800">
            Your API credentials are protected using industry-standard AES-256-GCM encryption 
            and are never stored in plain text in the database.
          </AlertDescription>
        </Alert>

        {showDetails && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  Encryption Process
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">1</span>
                    <span>API key entered in frontend form</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">2</span>
                    <span>Sent to secure edge function over HTTPS</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">3</span>
                    <span>Encrypted using AES-256-GCM algorithm</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">4</span>
                    <span>Stored in database as encrypted blob</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Key className="h-4 w-4 text-purple-500" />
                  Decryption Process
                </h4>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-mono">1</span>
                    <span>API call requires credentials</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-mono">2</span>
                    <span>Edge function retrieves encrypted data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-mono">3</span>
                    <span>Decrypted server-side using secret key</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-mono">4</span>
                    <span>Used for API call, never exposed to browser</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database Storage Format
              </h4>
              <div className="font-mono text-xs bg-background p-3 rounded border">
                <div className="text-muted-foreground mb-2">// Database record structure:</div>
                <div>user_id: "uuid-string"</div>
                <div>service_name: "mspace"</div>
                <div className="text-green-600">api_key_encrypted: "dGVzdA==:BMcQKf84..."</div>
                <div>username: "your-username"</div>
                <div>sender_id: "your-sender-id"</div>
                <div>is_active: true</div>
                <div className="text-muted-foreground mt-2">// Plain text API key is NEVER stored</div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Server className="h-4 w-4" />
                Security Features
              </h4>
              
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center gap-2 p-3 border rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">AES-256-GCM Encryption</div>
                    <div className="text-xs text-muted-foreground">Military-grade encryption standard</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 border rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">Unique Initialization Vectors</div>
                    <div className="text-xs text-muted-foreground">Each encryption uses a random IV</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 border rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">Server-Side Key Storage</div>
                    <div className="text-xs text-muted-foreground">Encryption key never exposed to browser</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 border rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">HTTPS Transport</div>
                    <div className="text-xs text-muted-foreground">All communication encrypted in transit</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 border rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">User Isolation</div>
                    <div className="text-xs text-muted-foreground">Each user's credentials are isolated</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-3 border rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium text-sm">Authenticated Access</div>
                    <div className="text-xs text-muted-foreground">Requires valid JWT token to decrypt</div>
                  </div>
                </div>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Technical Implementation:</strong>
                <br />• Encryption Key: 256-bit key stored as environment variable
                <br />• Algorithm: AES-256-GCM (Galois/Counter Mode)
                <br />• IV: 96-bit random initialization vector per encryption
                <br />• Format: base64(iv):base64(ciphertext)
                <br />• Access: Requires valid user authentication token
              </AlertDescription>
            </Alert>

            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Important Security Notes:</strong>
                <br />• The encryption key is stored server-side and never transmitted to browsers
                <br />• Even database administrators cannot see your plain text API keys
                <br />• Credentials are only decrypted in memory during API calls
                <br />• Each user can only access their own encrypted credentials
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <strong>Summary:</strong> Your API credentials are secured using the same encryption standards 
          used by banks and government systems. They are encrypted before storage and only decrypted 
          server-side when needed for API calls.
        </div>
      </CardContent>
    </Card>
  );
}
