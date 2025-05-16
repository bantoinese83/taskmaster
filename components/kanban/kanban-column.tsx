"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Archive } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SortableKanbanTask } from "@/components/kanban/sortable-kanban-task"
import { ColumnFilter, type ColumnFilterOptions } from "@/components/kanban/column-filter"
import { ColumnStatistics } from "@/components/kanban/column-statistics"
import { ColumnSorter } from "@/components/kanban/column-sorter"
import { BulkTaskMover } from "@/components/kanban/bulk-task-mover"
import type { Task, WorkflowStatus, ColumnSortOptions } from "@/lib/types"

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  selectedTaskId?: string | null
  selectedTaskRef?: React.RefObject<HTMLDivElement>
  status?: WorkflowStatus
  enforceWipLimits?: boolean
  columnFilters?: Record<string, ColumnFilterOptions>
  columnSorting?: Record<string, ColumnSortOptions>
  onColumnFilterChange?: (columnId: string, filters: ColumnFilterOptions) => void
  onColumnSortChange?: (columnId: string, sortOptions: ColumnSortOptions | null) => void
}

export function KanbanColumn({
  id,
  title,
  tasks,
  selectedTaskId,
  selectedTaskRef,
  status,
  enforceWipLimits,
  columnFilters,
  columnSorting,
  onColumnFilterChange,
  onColumnSortChange,
}: KanbanColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks)
  const [sortedTasks, setSortedTasks] = useState<Task[]>(tasks)

  // Apply column filters to tasks
  useEffect(() => {
    if (!columnFilters || !columnFilters[id]) {
      setFilteredTasks(tasks)
    } else {
      const filters = columnFilters[id]
      const hasAssigneeFilters = filters.assignees.length > 0
      const hasPriorityFilters = filters.priorities.length > 0
      const hasDueDateFilters = Object.values(filters.dueDateRange).some(Boolean)

      // If no filters are active, show all tasks
      if (!hasAssigneeFilters && !hasPriorityFilters && !hasDueDateFilters) {
        setFilteredTasks(tasks)
      } else {
        // Apply filters
        const filtered = tasks.filter((task) => {
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
        setFilteredTasks(filtered)
      }
    }
  }, [tasks, columnFilters, id])

  // Apply sorting to filtered tasks
  useEffect(() => {
    if (!columnSorting || !columnSorting[id]) {
      // No sorting, use the filtered tasks as is
      setSortedTasks(filteredTasks)
      return
    }

    const sortOptions = columnSorting[id]
    const { criterion, direction } = sortOptions

    const sorted = [...filteredTasks].sort((a, b) => {
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

    setSortedTasks(sorted)
  }, [filteredTasks, columnSorting, id])

  // Check if column is at or over WIP limit
  const hasWipLimit = status?.wipLimit !== undefined && status.wipLimit !== null
  const isAtWipLimit = hasWipLimit && tasks.length >= status!.wipLimit!
  const isOverWipLimit = hasWipLimit && tasks.length > status!.wipLimit!

  // Get column header color based on WIP limit status
  const getColumnHeaderClass = () => {
    if (status?.isArchived) {
      return "bg-muted/50 text-muted-foreground"
    }

    if (isOverWipLimit && enforceWipLimits) {
      return "bg-destructive/10 text-destructive border-destructive/50"
    }

    if (isAtWipLimit && enforceWipLimits) {
      return "bg-warning/10 text-warning border-warning/50"
    }

    return "bg-card"
  }

  // Handle column filter change
  const handleColumnFilterChange = (columnId: string, filters: ColumnFilterOptions) => {
    if (onColumnFilterChange) {
      onColumnFilterChange(columnId, filters)
    }
  }

  // Handle column sort change
  const handleColumnSortChange = (columnId: string, sortOptions: ColumnSortOptions | null) => {
    if (onColumnSortChange) {
      onColumnSortChange(columnId, sortOptions)
    }
  }

  // Check if column has active filters
  const hasActiveFilters =
    columnFilters &&
    columnFilters[id] &&
    (columnFilters[id].assignees.length > 0 ||
      columnFilters[id].priorities.length > 0 ||
      Object.values(columnFilters[id].dueDateRange).some(Boolean))

  return (
    <div
      ref={columnRef}
      className={`flex flex-col rounded-md border ${status?.isArchived ? "border-dashed opacity-75" : "border-solid"}`}
    >
      <div
        className={`p-3 font-medium border-b rounded-t-md flex items-center justify-between ${getColumnHeaderClass()}`}
        style={{
          backgroundColor: status?.isArchived ? undefined : `${status?.color}15`, // 15% opacity
          borderColor: status?.isArchived ? undefined : `${status?.color}30`, // 30% opacity
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status?.color }} />
          <span>{title}</span>

          {status?.isArchived && (
            <Badge variant="outline" className="ml-2 text-xs gap-1 bg-muted/50">
              <Archive className="h-3 w-3" />
              <span>Archived</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasWipLimit && (
            <Badge
              variant={isOverWipLimit ? "destructive" : isAtWipLimit ? "outline" : "secondary"}
              className="text-xs"
            >
              {tasks.length}/{status.wipLimit}
            </Badge>
          )}

          {!status?.isArchived && (
            <>
              {onColumnSortChange && (
                <ColumnSorter
                  columnId={id}
                  columnName={title}
                  columnColor={status?.color || "#3b82f6"}
                  onSortChange={handleColumnSortChange}
                  activeSortOptions={columnSorting?.[id] || null}
                />
              )}

              {onColumnFilterChange && (
                <ColumnFilter
                  columnId={id}
                  columnName={title}
                  columnColor={status?.color || "#3b82f6"}
                  onFilterChange={handleColumnFilterChange}
                  activeFilters={columnFilters?.[id] || null}
                  tasks={tasks}
                />
              )}

              <ColumnStatistics
                columnId={id}
                columnName={title}
                columnColor={status?.color || "#3b82f6"}
                tasks={tasks}
                status={status}
              />
            </>
          )}
        </div>
      </div>

      {!status?.isArchived && tasks.length > 0 && (
        <div className="px-2 py-1 bg-muted/10 border-b flex justify-between items-center">
          <BulkTaskMover columnId={id} tasks={tasks} />
        </div>
      )}

      <div className={`flex-1 p-2 min-h-[200px] ${status?.isArchived ? "bg-muted/20" : "bg-card/50"}`}>
        {sortedTasks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
            {hasActiveFilters ? "No matching tasks" : "No tasks"}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task) => (
              <SortableKanbanTask
                key={task.id}
                id={task.id}
                task={task}
                isSelected={task.id === selectedTaskId}
                selectedRef={task.id === selectedTaskId ? selectedTaskRef : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
