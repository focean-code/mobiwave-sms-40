import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Users, TestTube, CheckCircle } from "lucide-react";
import { MspaceCreditsManagerSmart } from "./MspaceCreditsManagerSmart";
import { MspaceResellerClientsSmart } from "./MspaceResellerClientsSmart";
import { MspaceBalanceAutomatic } from "./MspaceBalanceAutomatic";
import { MspaceResellerClientsAutomatic } from "./MspaceResellerClientsAutomatic";
import { MspaceAPITester } from "./MspaceAPITester";
import { EdgeFunctionStatus } from "./EdgeFunctionStatus";
import { EdgeFunctionDebugger } from "./EdgeFunctionDebugger";
import { EdgeFunctionEnvSetter } from "./EdgeFunctionEnvSetter";
import { AuthorizationTest } from "./AuthorizationTest";
import { EnvironmentDetector } from "./EnvironmentDetector";
import { ApiSecurityExplanation } from "./ApiSecurityExplanation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MspaceDashboardSimple() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Mspace Integration
        </h1>
        <p className="text-muted-foreground">
          Test your Mspace SMS API credentials and manage your account
        </p>
      </div>

      {/* Status Alert */}
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Automatic Integration:</strong> This system now provides automatic direct API access using your stored credentials,
          replicating the manual mode that worked before but without needing to re-enter credentials every time.
          No edge functions required - pure direct API calls for reliable operation.
        </AlertDescription>
      </Alert>

      {/* Main Dashboard */}
      <Tabs defaultValue="auto-balance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="auto-balance" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Auto Balance
          </TabsTrigger>
          <TabsTrigger value="auto-clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Auto Clients
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Manual Mode
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Diagnostics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="auto-balance" className="space-y-4">
          <MspaceBalanceAutomatic />
        </TabsContent>

        <TabsContent value="auto-clients" className="space-y-4">
          <MspaceResellerClientsAutomatic />
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Manual Mode:</strong> Smart credential detection with manual input fallback.
              This mode replicates the previous working approach with additional flexibility.
            </AlertDescription>
          </Alert>

          <h3 className="text-lg font-semibold">Balance Checker (Smart Mode)</h3>
          <MspaceCreditsManagerSmart />

          <h3 className="text-lg font-semibold">Reseller Clients (Smart Mode)</h3>
          <MspaceResellerClientsSmart />
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <EnvironmentDetector />

          <EdgeFunctionStatus />

          <EdgeFunctionEnvSetter />

          <AuthorizationTest />

          <EdgeFunctionDebugger />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                API Testing Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate curl commands, Node.js scripts, and Postman collections
                to test your mspace API credentials externally.
              </p>
              <MspaceAPITester />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
