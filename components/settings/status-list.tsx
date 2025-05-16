"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { useToast } from "@/hooks/use-toast"
import { SortableStatusItem } from "@/components/settings/sortable-status-item"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { WorkflowStatus } from "@/lib/types"
import { SharedLoading } from "@/components/ui/shared-loading"
import { SharedError } from "@/components/ui/shared-error"

export function StatusList() {
  const { statuses, isLoading, error, reorderStatuses } = useWorkflow()
  const { toast } = useToast()
  const [items, setItems] = useState<WorkflowStatus[]>(statuses)

  // Update items when statuses change
  if (JSON.stringify(statuses) !== JSON.stringify(items)) {
    setItems(statuses)
  }

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        return arrayMove(items, oldIndex, newIndex)
      })

      try {
        // Get the new order of status IDs
        const newOrder = items.map((item) => item.id)
        await reorderStatuses(newOrder)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reorder statuses. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading)
    return <SharedLoading />

  if (error)
    return <SharedError error={new Error(error)} />

  if (items.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No statuses found. Add your first status below.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Task Statuses</h3>
        <p className="text-sm text-muted-foreground">Drag to reorder</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((status) => (
              <SortableStatusItem key={status.id} status={status} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
