"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { useToast } from "@/hooks/use-toast"
import { ArchivedColumnsManager } from "./archived-columns-manager"
import { SwimlaneConfig } from "./swimlane-config"


const formSchema = z.object({
  name: z.string().min(1, "Workflow name is required").max(100),
  description: z.string().optional(),
  enforceWipLimits: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

export function WorkflowSettingsForm() {
  const { settings, updateWorkflowSettings } = useWorkflow()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: settings?.name || "My Workflow",
      description: settings?.description || "",
      enforceWipLimits: settings?.enforceWipLimits ?? false,
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await updateWorkflowSettings(data.name, data.description, data.enforceWipLimits)
      toast({
        title: "Settings updated",
        description: "Workflow settings have been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update workflow settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="swimlanes">Swimlanes</TabsTrigger>
        <TabsTrigger value="archived">Archived Columns</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Workflow" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your workflow..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enforceWipLimits"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enforce WIP Limits</FormLabel>
                    <FormDescription>
                      When enabled, tasks cannot be moved to columns that have reached their WIP limit
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="swimlanes">
        <SwimlaneConfig />
      </TabsContent>

      <TabsContent value="archived">
        <ArchivedColumnsManager />
      </TabsContent>
    </Tabs>
  )
}
