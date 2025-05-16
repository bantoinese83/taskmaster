"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, SortAsc, SortDesc } from "lucide-react"
import { useUsers } from "@/lib/hooks/use-users"
import { useToast } from "@/hooks/use-toast"
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_PRIORITY, TASK_PRIORITY_LABELS, SORT_OPTIONS } from "@/lib/constants"
import type { TaskFilter } from "@/lib/types"

interface TaskFilterBarProps {
  onFilterChange: (filter: TaskFilter) => void
  initialFilter?: TaskFilter
}

export function TaskFilterBar({ onFilterChange, initialFilter }: TaskFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { users } = useUsers()

  // Initialize filter state from URL or initial props
  const [filter, setFilter] = useState<TaskFilter>({
    status: (searchParams.get("status") as any) || initialFilter?.status || "ALL",
    priority: (searchParams.get("priority") as any) || initialFilter?.priority || "ALL",
    assigneeId: searchParams.get("assigneeId") || initialFilter?.assigneeId || "ALL",
    searchQuery: searchParams.get("search") || initialFilter?.searchQuery || "",
    sortBy: (searchParams.get("sortBy") as any) || initialFilter?.sortBy || "dueDate",
    sortDirection: (searchParams.get("sortDirection") as any) || initialFilter?.sortDirection || "asc",
  })

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams()

    if (filter.status && filter.status !== "ALL") {
      params.set("status", filter.status)
    }

    if (filter.priority && filter.priority !== "ALL") {
      params.set("priority", filter.priority)
    }

    if (filter.assigneeId && filter.assigneeId !== "ALL") {
      params.set("assigneeId", filter.assigneeId)
    }

    if (filter.searchQuery) {
      params.set("search", filter.searchQuery)
    }

    if (filter.sortBy) {
      params.set("sortBy", filter.sortBy)
    }

    if (filter.sortDirection) {
      params.set("sortDirection", filter.sortDirection)
    }

    // Update URL without refreshing the page
    router.push(`/tasks?${params.toString()}`, { scroll: false })

    // Notify parent component
    onFilterChange(filter)
  }, [filter, router, onFilterChange])

  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    setFilter((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSortDirection = () => {
    setFilter((prev) => ({
      ...prev,
      sortDirection: prev.sortDirection === "asc" ? "desc" : "asc",
    }))
  }

  const clearFilters = () => {
    setFilter({
      status: "ALL",
      priority: "ALL",
      assigneeId: "ALL",
      searchQuery: "",
      sortBy: "dueDate",
      sortDirection: "asc",
    })
  }

  const hasFilters =
    filter.status !== "ALL" ||
    filter.priority !== "ALL" ||
    filter.assigneeId !== "ALL" ||
    filter.searchQuery !== "" ||
    filter.sortBy !== "dueDate" ||
    filter.sortDirection !== "asc"

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <Select value={filter.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {Object.entries(TASK_STATUS).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {TASK_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Priority
            </label>
            <Select value={filter.priority} onValueChange={(value) => handleFilterChange("priority", value)}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All priorities</SelectItem>
                {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {TASK_PRIORITY_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="assignee" className="text-sm font-medium">
              Assignee
            </label>
            <Select value={filter.assigneeId} onValueChange={(value) => handleFilterChange("assigneeId", value)}>
              <SelectTrigger id="assignee">
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All assignees</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex items-center gap-1" onClick={toggleSortDirection}>
            {filter.sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            <span className="sr-only">Toggle sort direction</span>
          </Button>

          {hasFilters && (
            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-1">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            value={filter.searchQuery}
            onChange={(e) => handleFilterChange("searchQuery", e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Select value={filter.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SORT_OPTIONS.DUE_DATE}>Due Date</SelectItem>
              <SelectItem value={SORT_OPTIONS.PRIORITY}>Priority</SelectItem>
              <SelectItem value={SORT_OPTIONS.TITLE}>Title</SelectItem>
              <SelectItem value={SORT_OPTIONS.CREATED_AT}>Created Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
