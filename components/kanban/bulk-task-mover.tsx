"use client"

import { useState } from "react"
import { Check, ChevronDown, Loader2, MoveHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useTaskStore } from "@/lib/store/task-store"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { TASK_STATUS } from "@/lib/constants"
import type { Task } from "@/lib/types"

interface BulkTaskMoverProps {
  columnId: string
  tasks: Task[]
}

export function BulkTaskMover({ columnId, tasks }: BulkTaskMoverProps) {
  const { toast } = useToast()
  const { statuses, settings } = useWorkflow()
  const { selectedTasks, bulkUpdateTasks, deselectAllTasks } = useTaskStore()
  const [isMoving, setIsMoving] = useState(false)

  // Filter out tasks that are not in the current column
  const tasksInColumn = tasks.filter((task) => {
    if (statuses.length > 0) {
      return task.statusId === columnId
    }
    return task.status === columnId
  })

  // Get IDs of tasks in this column that are selected
  const selectedTasksInColumn = Array.from(selectedTasks).filter((taskId) =>
    tasksInColumn.some((task) => task.id === taskId),
  )

  // Check if all tasks in this column are selected
  const allTasksSelected = tasksInColumn.length > 0 && tasksInColumn.every((task) => selectedTasks.has(task.id))

  // Toggle selection of all tasks in this column
  const toggleSelectAll = () => {
    if (allTasksSelected) {
      // Deselect all tasks in this column
      selectedTasksInColumn.forEach((taskId) => {
        useTaskStore.getState().deselectTask(taskId)
      })
    } else {
      // Select all tasks in this column
      useTaskStore.getState().selectAllTasks(tasksInColumn.map((task) => task.id))
    }
  }

  // Get available target columns (excluding current column and archived columns)
  const availableTargetColumns =
    statuses.length > 0
      ? statuses.filter((status) => status.id !== columnId && !status.isArchived)
      : Object.values(TASK_STATUS)
          .filter((status) => status !== columnId)
          .map((status) => ({
            id: status,
            name: status,
            isArchived: false,
            color: "#3b82f6", // Default blue color
            order: 0,
            isDefault: false,
            createdAt: "",
            updatedAt: "",
            workflowSettingsId: "",
          }))

  // Move selected tasks to target column
  const moveTasksToColumn = async (targetColumnId: string) => {
    if (selectedTasksInColumn.length === 0) return

    // Check if target column has WIP limit
    const targetColumn = statuses.find((status) => status.id === targetColumnId)

    if (settings?.enforceWipLimits && targetColumn?.wipLimit) {
      // Count current tasks in target column
      const tasksInTargetColumn = tasks.filter((task) => {
        if (statuses.length > 0) {
          return task.statusId === targetColumnId
        }
        return task.status === targetColumnId
      }).length

      // Check if adding selected tasks would exceed WIP limit
      if (tasksInTargetColumn + selectedTasksInColumn.length > targetColumn.wipLimit) {
        toast({
          title: "WIP Limit Exceeded",
          description: `Moving these tasks would exceed the WIP limit of ${targetColumn.wipLimit} for ${targetColumn.name}`,
          variant: "destructive",
        })
        return
      }
    }

    setIsMoving(true)

    try {
      // Prepare updates based on whether we're using custom statuses or default statuses
      const updates = statuses.length > 0 ? { statusId: targetColumnId } : { status: targetColumnId }

      await bulkUpdateTasks(selectedTasksInColumn, updates)

      toast({
        title: "Tasks Moved",
        description: `Successfully moved ${selectedTasksInColumn.length} tasks to ${
          targetColumn?.name || targetColumnId
        }`,
      })
    } catch (error) {
      console.error("Failed to move tasks:", error)
      toast({
        title: "Error",
        description: "Failed to move tasks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMoving(false)
    }
  }

  // If no tasks in column or no selected tasks, don't render
  if (tasksInColumn.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={`h-6 px-2 text-xs ${allTasksSelected ? "bg-primary/10" : ""}`}
        onClick={toggleSelectAll}
      >
        <Check className={`h-3.5 w-3.5 mr-1 ${allTasksSelected ? "opacity-100" : "opacity-40"}`} />
        {allTasksSelected ? "Deselect All" : "Select All"}
      </Button>

      {selectedTasksInColumn.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isMoving}>
            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
              {isMoving ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <MoveHorizontal className="h-3.5 w-3.5 mr-1" />
              )}
              Move {selectedTasksInColumn.length} {selectedTasksInColumn.length === 1 ? "Task" : "Tasks"}
              <ChevronDown className="h-3.5 w-3.5 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {availableTargetColumns.map((column) => (
              <DropdownMenuItem
                key={column.id}
                onClick={() => moveTasksToColumn(column.id)}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
                <span>Move to {column.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
