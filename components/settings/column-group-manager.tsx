"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useWorkflowStore } from "@/lib/store/workflow-store"
import { SortableColumnGroup } from "@/components/settings/sortable-column-group"
import { ColorPalette } from "@/components/ui/color-palette"
import type { ColumnGroup } from "@/lib/types"

const formSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format")
    .optional(),
})

type FormData = z.infer<typeof formSchema>

export function ColumnGroupManager() {
  const { columnGroups, createColumnGroup, updateColumnGroup, deleteColumnGroup, reorderColumnGroups } =
    useWorkflowStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingGroup, setEditingGroup] = useState<ColumnGroup | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#3b82f6", // Default blue color
    },
  })

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Reset form when editing group changes
  if (editingGroup && form.formState.isDirty === false) {
    form.reset({
      name: editingGroup.name,
      description: editingGroup.description || "",
      color: editingGroup.color || "#3b82f6",
    })
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      if (editingGroup) {
        // Update existing group
        await updateColumnGroup(editingGroup.id, data.name, data.description, data.color)
        toast({
          title: "Group updated",
          description: "The column group has been updated successfully",
        })
        setEditingGroup(null)
      } else {
        // Create new group
        await createColumnGroup(data.name, data.description, data.color)
        toast({
          title: "Group created",
          description: "The new column group has been created successfully",
        })
      }
      form.reset({
        name: "",
        description: "",
        color: "#3b82f6",
      })
      setShowColorPicker(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save column group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (group: ColumnGroup) => {
    setEditingGroup(group)
    setShowColorPicker(!!group.color)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteColumnGroup(id)
      toast({
        title: "Group deleted",
        description: "The column group has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete column group. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditingGroup(null)
    form.reset({
      name: "",
      description: "",
      color: "#3b82f6",
    })
    setShowColorPicker(false)
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Find the indices of the dragged and target items
    const oldIndex = columnGroups.findIndex((group) => group.id === active.id)
    const newIndex = columnGroups.findIndex((group) => group.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Create a new array with the updated order
    const newOrder = [...columnGroups]
    const [movedItem] = newOrder.splice(oldIndex, 1)
    newOrder.splice(newIndex, 0, movedItem)

    // Update the order on the server
    try {
      await reorderColumnGroups(newOrder.map((group) => group.id))
      toast({
        title: "Order updated",
        description: "Column group order has been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update column group order. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingGroup ? "Edit Column Group" : "Create Column Group"}</CardTitle>
          <CardDescription>
            {editingGroup
              ? "Update the details of this column group"
              : "Create a new group to organize your workflow columns"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Development" {...field} />
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
                      <Textarea placeholder="Development phase columns..." {...field} />
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Color (Optional)</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                      >
                        {showColorPicker ? "Hide Color Picker" : "Show Color Picker"}
                      </Button>
                    </div>
                    {showColorPicker && (
                      <FormControl>
                        <div className="space-y-2">
                          <ColorPalette value={field.value || ""} onChange={field.onChange} />
                          <div className="flex items-center gap-2">
                            <Input
                              type="color"
                              value={field.value || "#3b82f6"}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="w-12 h-10 p-1"
                            />
                            <Input
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                              placeholder="#3b82f6"
                            />
                          </div>
                        </div>
                      </FormControl>
                    )}
                    <FormDescription>Choose a color for the group header (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                {editingGroup && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? editingGroup
                      ? "Updating..."
                      : "Creating..."
                    : editingGroup
                      ? "Update Group"
                      : "Create Group"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Column Groups</CardTitle>
          <CardDescription>Manage and reorder your column groups</CardDescription>
        </CardHeader>
        <CardContent>
          {columnGroups.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={columnGroups.map((group) => group.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {columnGroups.map((group) => (
                    <SortableColumnGroup
                      key={group.id}
                      group={group}
                      onEdit={() => handleEdit(group)}
                      onDelete={() => handleDelete(group.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No column groups created yet. Create your first group above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
