import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"
import { WorkflowSettingsForm } from "@/components/settings/workflow-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowTemplateSelector } from "@/components/settings/workflow-template-selector"

export default async function WorkflowSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(ROUTES.SIGN_IN)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Workflow Settings</h1>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <WorkflowSettingsForm />
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <CardDescription>Choose from predefined templates to quickly set up your workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <WorkflowTemplateSelector />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
