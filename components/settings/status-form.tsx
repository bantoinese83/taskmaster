"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ColorPalette } from "@/components/ui/color-palette"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { useWorkflowStore } from "@/lib/store/workflow-store"
import { useToast } from "@/hooks/use-toast"
import type { WorkflowStatus } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(1, "Status name is required").max(50),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  enableWipLimit: z.boolean().default(false),
  wipLimit: z.number().int().min(1, "WIP limit must be at least 1").nullable().optional(),
  columnGroupId: z.string().nullable().optional(),
})

type FormData = z.infer<typeof formSchema>

interface StatusFormProps {
  status?: WorkflowStatus
  onCancel?: () => void
  onSuccess?: () => void
}

export function StatusForm({ status, onCancel, onSuccess }: StatusFormProps) {
  const { createStatus, updateStatus } = useWorkflow()
  const { columnGroups, assignStatusToGroup } = useWorkflowStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCustomColor, setShowCustomColor] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: status?.name || "",
      description: status?.description || "",
      color: status?.color || "#3b82f6", // Default blue color
      enableWipLimit: status?.wipLimit !== null && status?.wipLimit !== undefined,
      wipLimit: status?.wipLimit || null,
      columnGroupId: status?.columnGroupId || null,
    },
  })

  const enableWipLimit = form.watch("enableWipLimit")

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Calculate the actual WIP limit to save
      const wipLimit = data.enableWipLimit ? data.wipLimit : null

      if (status) {
        // Update existing status
        await updateStatus(status.id, data.name, data.description, data.color, wipLimit)

        // Update column group assignment if changed
        if (data.columnGroupId !== status.columnGroupId) {
          await assignStatusToGroup(status.id, data.columnGroupId || null)
        }

        toast({
          title: "Status updated",
          description: "The status has been updated successfully",
        })
      } else {
        // Create new status
        const newStatus = await createStatus(data.name, data.description, data.color, wipLimit)

        // Assign to column group if selected
        if (data.columnGroupId && newStatus) {
          await assignStatusToGroup(newStatus.id, data.columnGroupId)
        }

        toast({
          title: "Status created",
          description: "The new status has been created successfully",
        })
        form.reset({
          name: "",
          description: "",
          color: "#3b82f6",
          enableWipLimit: false,
          wipLimit: null,
          columnGroupId: null,
        })
      }

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status Name</FormLabel>
              <FormControl>
                <Input placeholder="To Do" {...field} />
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
                <Textarea placeholder="Tasks that need to be started..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <ColorPalette value={field.value} onChange={field.onChange} />

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomColor(!showCustomColor)}
                    >
                      {showCustomColor ? "Hide Custom Color" : "Custom Color"}
                    </Button>

                    {showCustomColor && (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex-1"
                          placeholder="#3b82f6"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormDescription>Choose a color for this status</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="columnGroupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Column Group (Optional)</FormLabel>
              <FormControl>
                <select {...field} className="border rounded px-2 py-1">
                  <option value={null}>None</option>
                  {columnGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>Assign this status to a column group</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="enableWipLimit"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel>Enable WIP Limit</FormLabel>
                <FormDescription>Limit the number of tasks in this status</FormDescription>
              </div>
              <FormControl>
                <input
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  id="enableWipLimit"
                  type="checkbox"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {enableWipLimit && (
          <FormField
            control={form.control}
            name="wipLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WIP Limit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
                    {...field}
                    onChange={(e) => {
                      const value = Number.parseInt(e.target.value)
                      field.onChange(isNaN(value) ? null : value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {status ? "Update Status" : "Create Status"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
