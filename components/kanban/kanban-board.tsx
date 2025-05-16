// This file will be split into two: kanban-board.server.tsx (server) and kanban-board.client.tsx (client). Any pure logic will be moved to lib/kanban-board-utils.ts. The current file will be deleted after the split.

"use client"

import { Button } from "@/components/ui/button"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { useToast } from "@/hooks/use-toast"
import { KanbanColumn } from "@/components/kanban/kanban-column"
import { KanbanTask } from "@/components/kanban/kanban-task"
import { KanbanSwimlane } from "@/components/kanban/kanban-swimlane"
import { useTasks } from "@/lib/hooks/use-tasks"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { useUsers } from "@/lib/hooks/use-users"
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants"
import type { ColumnFilterOptions } from "@/components/kanban/column-filter"
import type { Task, TaskStatus, Swimlane, ColumnSortOptions } from "@/lib/types"

interface KanbanBoardProps {
  tasks: Task[]
  selectedTaskId?: string | null
}

export default function KanbanBoard({ tasks, selectedTaskId }: KanbanBoardProps) {
  const { updateTask } = useTasks()
  const { statuses, settings, toggleArchivedColumnsVisibility } = useWorkflow()
  const { users } = useUsers()
  const { toast } = useToast()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
  const selectedTaskRef = useRef<HTMLDivElement>(null)
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<Set<string>>(new Set())
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilterOptions>>({})
  const [columnSorting, setColumnSorting] = useState<Record<string, ColumnSortOptions>>({})

  // Update local tasks when tasks prop changes
  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  // Scroll to selected task
  useEffect(() => {
    if (selectedTaskId && selectedTaskRef.current) {
      selectedTaskRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [selectedTaskId])

  // Configure DnD sensors
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

  // Generate swimlanes based on the selected property
  const swimlanes = useMemo(() => {
    const swimlaneProperty = settings?.swimlaneProperty || "none"

    if (swimlaneProperty === "none") {
      return [{ id: "default", title: "All Tasks", value: null }]
    }

    const lanes: Swimlane[] = []

    if (swimlaneProperty === "assignee") {
      // Add "Unassigned" swimlane
      lanes.push({
        id: "unassigned",
        title: "Unassigned",
        value: null,
      })

      // Add swimlane for each user
      users.forEach((user) => {
        lanes.push({
          id: user.id,
          title: user.name,
          value: user.id,
          isCollapsed: collapsedSwimlanes.has(user.id),
        })
      })
    } else if (swimlaneProperty === "priority") {
      // Add swimlane for each priority
      Object.values(TASK_PRIORITY).forEach((priority) => {
        const priorityLabel = priority.charAt(0) + priority.slice(1).toLowerCase()
        lanes.push({
          id: priority,
          title: priorityLabel,
          value: priority,
          isCollapsed: collapsedSwimlanes.has(priority),
        })
      })
    } else if (swimlaneProperty === "dueDate") {
      // Add swimlanes for due date ranges
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)

      lanes.push(
        {
          id: "overdue",
          title: "Overdue",
          value: "overdue",
          isCollapsed: collapsedSwimlanes.has("overdue"),
        },
        {
          id: "today",
          title: "Due Today",
          value: "today",
          isCollapsed: collapsedSwimlanes.has("today"),
        },
        {
          id: "tomorrow",
          title: "Due Tomorrow",
          value: "tomorrow",
          isCollapsed: collapsedSwimlanes.has("tomorrow"),
        },
        {
          id: "this-week",
          title: "Due This Week",
          value: "this-week",
          isCollapsed: collapsedSwimlanes.has("this-week"),
        },
        {
          id: "later",
          title: "Due Later",
          value: "later",
          isCollapsed: collapsedSwimlanes.has("later"),
        },
        {
          id: "no-date",
          title: "No Due Date",
          value: null,
          isCollapsed: collapsedSwimlanes.has("no-date"),
        },
      )
    }

    return lanes
  }, [settings?.swimlaneProperty, users, collapsedSwimlanes])

  // Filter statuses based on archived status
  const filteredStatuses = useMemo(() => {
    return statuses
      .filter((status) => {
        // If showArchivedColumns is true, show all columns
        if (settings?.showArchivedColumns) {
          return true
        }
        // Otherwise, only show non-archived columns
        return !status.isArchived
      })
      .sort((a, b) => {
        // Sort by archived status first (non-archived first)
        if (a.isArchived !== b.isArchived) {
          return a.isArchived ? 1 : -1
        }
        // Then sort by order
        return a.order - b.order
      })
  }, [statuses, settings?.showArchivedColumns])

  // Handle column filter change
  const handleColumnFilterChange = (columnId: string, filters: ColumnFilterOptions) => {
    setColumnFilters((prev) => ({
      ...prev,
      [columnId]: filters,
    }))
  }

  // Handle column sort change
  const handleColumnSortChange = (columnId: string, sortOptions: ColumnSortOptions | null) => {
    setColumnSorting((prev) => {
      const newSorting = { ...prev }
      if (sortOptions === null) {
        delete newSorting[columnId]
      } else {
        newSorting[columnId] = sortOptions
      }
      return newSorting
    })
  }

  // Clear all column filters
  const clearAllColumnFilters = () => {
    setColumnFilters({})
  }

  // Clear all column sorting
  const clearAllColumnSorting = () => {
    setColumnSorting({})
  }

  // Group tasks by swimlane and status
  const getTasksForSwimlaneAndStatus = useCallback(
    (swimlaneId: string, statusId: string) => {
      const swimlaneProperty = settings?.swimlaneProperty || "none"

      // First, get all tasks for this status
      let statusTasks = localTasks.filter((task) => {
        if (statuses.length > 0) {
          return task.statusId === statusId
        }
        return task.status === statusId
      })

      // Apply column filters if any
      if (columnFilters[statusId]) {
        const filters = columnFilters[statusId]
        const hasAssigneeFilters = filters.assignees.length > 0
        const hasPriorityFilters = filters.priorities.length > 0
        const hasDueDateFilters = Object.values(filters.dueDateRange).some(Boolean)

        if (hasAssigneeFilters || hasPriorityFilters || hasDueDateFilters) {
          statusTasks = statusTasks.filter((task) => {
            // Assignee filter
            if (hasAssigneeFilters) {
              if (filters.assignees.includes("unassigned") && !task.assigneeId) {
                // Task matches "unassigned" filter
              } else if (task.assigneeId && filters.assignees.includes(task.assigneeId)) {
                // Task matches a specific assignee filter
              } else {
                return false // Task doesn't match any assignee filter
              }
            }

            // Priority filter
            if (hasPriorityFilters && !filters.priorities.includes(task.priority)) {
              return false
            }

            // Due date filter
            if (hasDueDateFilters) {
              if (!task.dueDate && !filters.dueDateRange.noDueDate) {
                return false
              } else if (task.dueDate) {
                const dueDate = new Date(task.dueDate)
                const today = new Date()
                today.setHours(0, 0, 0, 0)

                const tomorrow = new Date(today)
                tomorrow.setDate(tomorrow.getDate() + 1)

                const nextWeek = new Date(today)
                nextWeek.setDate(nextWeek.getDate() + 7)

                if (dueDate < today && !filters.dueDateRange.overdue) {
                  return false
                } else if (dueDate.getTime() === today.getTime() && !filters.dueDateRange.today) {
                  return false
                } else if (dueDate < nextWeek && dueDate > today && !filters.dueDateRange.thisWeek) {
                  return false
                } else if (dueDate >= nextWeek && !filters.dueDateRange.later) {
                  return false
                }
              }
            }

            return true
          })
        }
      }

      // Apply column sorting if any
      if (columnSorting[statusId]) {
        const sortOptions = columnSorting[statusId]
        const { criterion, direction } = sortOptions

        statusTasks = [...statusTasks].sort((a, b) => {
          let comparison = 0

          switch (criterion) {
            case "dueDate":
              // Handle null due dates
              if (!a.dueDate && !b.dueDate) return 0
              if (!a.dueDate) return direction === "asc" ? 1 : -1
              if (!b.dueDate) return direction === "asc" ? -1 : 1
              comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
              break

            case "priority":
              const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
              comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
              break

            case "title":
              comparison = a.title.localeCompare(b.title)
              break

            case "createdAt":
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              break

            case "updatedAt":
              comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
              break

            case "assignee":
              // Handle null assignees
              if (!a.assignee?.name && !b.assignee?.name) return 0
              if (!a.assignee?.name) return direction === "asc" ? -1 : 1
              if (!b.assignee?.name) return direction === "asc" ? 1 : -1
              comparison = a.assignee.name.localeCompare(b.assignee.name)
              break

            default:
              return 0
          }

          return direction === "asc" ? comparison : -comparison
        })
      }

      if (swimlaneProperty === "none") {
        // If no swimlanes, return all filtered tasks for this status
        return statusTasks
      }

      // Then filter by swimlane
      return statusTasks.filter((task) => {
        let belongsToSwimlane = false

        if (swimlaneProperty === "assignee") {
          if (swimlaneId === "unassigned") {
            belongsToSwimlane = !task.assigneeId
          } else {
            belongsToSwimlane = task.assigneeId === swimlaneId
          }
        } else if (swimlaneProperty === "priority") {
          belongsToSwimlane = task.priority === swimlaneId
        } else if (swimlaneProperty === "dueDate") {
          if (!task.dueDate) {
            belongsToSwimlane = swimlaneId === "no-date"
          } else {
            const dueDate = new Date(task.dueDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            const nextWeek = new Date(today)
            nextWeek.setDate(nextWeek.getDate() + 7)

            if (dueDate < today) {
              belongsToSwimlane = swimlaneId === "overdue"
            } else if (dueDate.getTime() === today.getTime()) {
              belongsToSwimlane = swimlaneId === "today"
            } else if (dueDate.getTime() === tomorrow.getTime()) {
              belongsToSwimlane = swimlaneId === "tomorrow"
            } else if (dueDate < nextWeek) {
              belongsToSwimlane = swimlaneId === "this-week"
            } else {
              belongsToSwimlane = swimlaneId === "later"
            }
          }
        }

        return belongsToSwimlane
      })
    },
    [localTasks, settings?.swimlaneProperty, statuses, columnFilters, columnSorting],
  )

  // Get active task
  const getActiveTask = useCallback(() => {
    if (!activeId) return null
    return localTasks.find((task) => task.id === activeId) || null
  }, [activeId, localTasks])

  // Handle drag start
  const handleDragStart = (event: unknown) => {
    const { active } = event as { active: { id: string } };
    setActiveId(active.id);
  };

  // Handle drag end
  const handleDragEnd = async (event: unknown) => {
    const { active, over } = event as { active: { id: string }, over: string | null };

    if (!over) {
      setActiveId(null)
      return
    }

    // Extract status ID from the over ID (format: "cell-{swimlaneId}-{statusId}")
    const [, , statusId] = over.split("-")

    // Check if task was dropped on a different column
    const activeTask = localTasks.find((task) => task.id === active.id)
    if (!activeTask) {
      setActiveId(null)
      return
    }

    // Check if the status is the same
    const currentStatusId = statuses.length > 0 ? activeTask.statusId : activeTask.status
    if (currentStatusId === statusId) {
      setActiveId(null)
      return
    }

    // Check if the target column is archived
    const targetStatus = statuses.find((status) => status.id === statusId)
    if (targetStatus?.isArchived) {
      toast({
        title: "Cannot move to archived column",
        description: "Tasks cannot be moved to archived columns. Please unarchive the column first.",
        variant: "destructive",
      })
      setActiveId(null)
      return
    }

    // Check if the target column has a WIP limit
    const hasWipLimit = targetStatus?.wipLimit !== null && targetStatus?.wipLimit !== undefined

    // Count tasks in the target status across all swimlanes
    const tasksInTargetStatus = localTasks.filter((task) => {
      if (statuses.length > 0) {
        return task.statusId === statusId
      }
      return task.status === statusId
    })

    const isAtWipLimit = hasWipLimit && tasksInTargetStatus.length >= targetStatus!.wipLimit!

    // If enforcing WIP limits and the column is at its limit, prevent the move
    if (settings?.enforceWipLimits && isAtWipLimit) {
      toast({
        title: "WIP Limit Reached",
        description: `Cannot move task to ${targetStatus?.name}. The column has reached its WIP limit of ${targetStatus?.wipLimit}.`,
        variant: "destructive",
      })
      setActiveId(null)
      return
    }

    // Update the task status locally first for immediate feedback
    setLocalTasks((prev) =>
      prev.map((task) => {
        if (task.id === active.id) {
          if (statuses.length > 0) {
            // Using custom statuses
            return { ...task, statusId }
          } else {
            // Using default statuses
            return { ...task, status: statusId as TaskStatus }
          }
        }
        return task
      }),
    )

    // Then update on the server
    try {
      if (statuses.length > 0) {
        // Using custom statuses
        await updateTask(active.id, { statusId })
      } else {
        // Using default statuses
        await updateTask(active.id, { status: statusId as TaskStatus })
      }
    } catch (error) {
      console.error("Failed to update task status:", error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      })
      // Revert the local change on error
      setLocalTasks(tasks)
    }

    setActiveId(null)
  }

  // Handle swimlane collapse toggle
  const toggleSwimlaneCollapse = (swimlaneId: string) => {
    setCollapsedSwimlanes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(swimlaneId)) {
        newSet.delete(swimlaneId)
      } else {
        newSet.add(swimlaneId)
      }
      return newSet
    })
  }

  // Handle toggle archived columns visibility
  const handleToggleArchivedColumns = () => {
    toggleArchivedColumnsVisibility()
  }

  // Determine which columns to display
  const columnsToDisplay =
    filteredStatuses.length > 0
      ? filteredStatuses
      : Object.values(TASK_STATUS).map((status) => ({
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

  // Render swimlane-based board if swimlanes are enabled
  const useSwimlanes = settings?.swimlaneProperty && settings.swimlaneProperty !== "none"

  // Count archived columns
  const archivedColumnsCount = statuses.filter((status) => status.isArchived).length

  // Count active column filters
  const activeFilterCount = Object.keys(columnFilters).length

  // Count active column sorting
  const activeSortingCount = Object.keys(columnSorting).length

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllColumnFilters} className="text-xs">
            Clear All Filters ({activeFilterCount})
          </Button>
        )}

        {activeSortingCount > 0 && (
          <Button variant="outline" size="sm" onClick={clearAllColumnSorting} className="text-xs">
            Clear All Sorting ({activeSortingCount})
          </Button>
        )}

        {archivedColumnsCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleToggleArchivedColumns} className="text-xs ml-auto">
            {settings?.showArchivedColumns
              ? "Hide Archived Columns"
              : `Show Archived Columns (${archivedColumnsCount})`}
          </Button>
        )}
      </div>

      {useSwimlanes ? (
        <div className="flex flex-col space-y-8">
          {swimlanes.map((swimlane) => (
            <KanbanSwimlane
              key={swimlane.id}
              swimlane={swimlane}
              columns={filteredStatuses}
              getTasksForCell={getTasksForSwimlaneAndStatus}
              selectedTaskId={selectedTaskId}
              selectedTaskRef={selectedTaskRef}
              enforceWipLimits={settings?.enforceWipLimits}
              isCollapsed={collapsedSwimlanes.has(swimlane.id)}
              onToggleCollapse={() => toggleSwimlaneCollapse(swimlane.id)}
              columnFilters={columnFilters}
              columnSorting={columnSorting}
              onColumnFilterChange={handleColumnFilterChange}
              onColumnSortChange={handleColumnSortChange}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {columnsToDisplay.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.name}
              tasks={localTasks.filter((task) => {
                if (statuses.length > 0) {
                  return task.statusId === column.id
                }
                return task.status === column.id
              })}
              selectedTaskId={selectedTaskId}
              selectedTaskRef={selectedTaskRef}
              status={column}
              enforceWipLimits={settings?.enforceWipLimits}
              columnFilters={columnFilters}
              columnSorting={columnSorting}
              onColumnFilterChange={handleColumnFilterChange}
              onColumnSortChange={handleColumnSortChange}
            />
          ))}
        </div>
      )}

      <DragOverlay>{activeId ? <KanbanTask task={getActiveTask()!} isOverlay onClick={() => {}} /> : null}</DragOverlay>
    </DndContext>
  )
}
