// This file will be split into two: kanban-swimlane.server.tsx (server) and kanban-swimlane.client.tsx (client). Any pure logic will be moved to lib/kanban-swimlane-utils.ts. The current file will be deleted after the split.

"use client"

import type React from "react"

import { useRef } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KanbanColumn } from "@/components/kanban/kanban-column"
import { SwimlaneStatistics } from "@/components/kanban/swimlane-statistics.server"
import type { ColumnFilterOptions } from "@/components/kanban/column-filter"
import type { Swimlane, WorkflowStatus, Task } from "@/lib/types"

interface KanbanSwimlaneProps {
  swimlane: Swimlane
  columns: WorkflowStatus[]
  getTasksForCell: (swimlaneId: string, statusId: string) => Task[]
  selectedTaskId?: string | null
  selectedTaskRef?: React.RefObject<HTMLDivElement>
  enforceWipLimits?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: (swimlaneId: string) => void
  columnFilters?: Record<string, ColumnFilterOptions>
  onColumnFilterChange?: (columnId: string, filters: ColumnFilterOptions) => void
}

export function KanbanSwimlane({
  swimlane,
  columns,
  getTasksForCell,
  selectedTaskId,
  selectedTaskRef,
  enforceWipLimits,
  isCollapsed = false,
  onToggleCollapse,
  columnFilters,
  onColumnFilterChange,
}: KanbanSwimlaneProps) {
  const swimlaneRef = useRef<HTMLDivElement>(null)

  // Get all tasks for this swimlane across all columns
  const allSwimlaneTasksAcrossColumns = columns.reduce((tasks, column) => {
    return [...tasks, ...getTasksForCell(swimlane.id, column.id)]
  }, [] as Task[])

  return (
    <div ref={swimlaneRef} className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onToggleCollapse?.(swimlane.id)}>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="sr-only">{isCollapsed ? "Expand swimlane" : "Collapse swimlane"}</span>
          </Button>
          <h3 className="text-sm font-medium">{swimlane.title}</h3>
          <span className="text-xs text-muted-foreground">({allSwimlaneTasksAcrossColumns.length})</span>
        </div>

        {/* Add swimlane statistics */}
        <SwimlaneStatistics
          swimlaneId={swimlane.id}
          swimlaneName={swimlane.title}
          tasks={allSwimlaneTasksAcrossColumns}
          statuses={columns}
        />
      </div>

      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {columns.map((column) => {
            const cellId = `cell-${swimlane.id}-${column.id}`
            const tasksForCell = getTasksForCell(swimlane.id, column.id)

            return (
              <div key={cellId} id={cellId}>
                <KanbanColumn
                  id={column.id}
                  title={column.name}
                  tasks={tasksForCell}
                  selectedTaskId={selectedTaskId}
                  selectedTaskRef={selectedTaskRef}
                  status={column}
                  enforceWipLimits={enforceWipLimits}
                  columnFilters={columnFilters}
                  onColumnFilterChange={onColumnFilterChange}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
