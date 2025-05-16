"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useUsers } from "@/lib/hooks/use-users"
import { KanbanSearch } from "@/components/kanban/kanban-search"
import { TASK_PRIORITY, TASK_PRIORITY_LABELS } from "@/lib/constants"
import type { TaskPriority, Task } from "@/lib/types"

interface KanbanFilterBarProps {
  onFilterChange: (filters: KanbanFilters) => void
  onTaskSelect: (taskId: string) => void
  tasks: Task[]
}

export interface KanbanFilters {
  searchQuery: string
  priority: TaskPriority | "ALL"
  assigneeId: string | "ALL"
}

export function KanbanFilterBar({ onFilterChange, onTaskSelect, tasks }: KanbanFilterBarProps) {
  const { users, isLoading: isLoadingUsers } = useUsers()
  const [filters, setFilters] = useState<KanbanFilters>({
    searchQuery: "",
    priority: "ALL",
    assigneeId: "ALL",
  })

  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  // Update a single filter
  const updateFilter = <K extends keyof KanbanFilters>(key: K, value: KanbanFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      priority: "ALL",
      assigneeId: "ALL",
    })
  }

  // Handle search query change
  const handleSearchChange = (query: string) => {
    updateFilter("searchQuery", query)
  }

  // Check if any filters are active
  const hasActiveFilters = filters.searchQuery !== "" || filters.priority !== "ALL" || filters.assigneeId !== "ALL"

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Enhanced search component */}
        <KanbanSearch
          tasks={tasks}
          onSearchChange={handleSearchChange}
          onTaskSelect={onTaskSelect}
          searchQuery={filters.searchQuery}
        />

        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.priority}
            onValueChange={(value) => updateFilter("priority", value as TaskPriority | "ALL")}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                <SelectItem key={key} value={value}>
                  {TASK_PRIORITY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.assigneeId} onValueChange={(value) => updateFilter("assigneeId", value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Assignees</SelectItem>
              <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" size="icon" onClick={resetFilters} className="h-10 w-10">
              <X className="h-4 w-4" />
              <span className="sr-only">Clear filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.priority !== "ALL" && (
            <Badge variant="secondary" className="flex gap-1 items-center">
              Priority: {TASK_PRIORITY_LABELS[filters.priority as TaskPriority]}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("priority", "ALL")} />
            </Badge>
          )}

          {filters.assigneeId !== "ALL" && (
            <Badge variant="secondary" className="flex gap-1 items-center">
              Assignee:{" "}
              {filters.assigneeId === "UNASSIGNED"
                ? "Unassigned"
                : users.find((u) => u.id === filters.assigneeId)?.name || "Unknown"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("assigneeId", "ALL")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
