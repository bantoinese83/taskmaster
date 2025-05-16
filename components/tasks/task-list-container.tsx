"use client"

import { useEffect } from "react"
import { TaskFilterBar } from "@/components/tasks/task-filter-bar"
import TaskList from "@/components/tasks/task-list"
import { useTasks } from "@/lib/hooks/use-tasks"
import type { TaskFilter } from "@/lib/types"
import { SharedError } from "@/components/ui/shared-error"

interface TaskListContainerProps {
  initialFilter?: TaskFilter
}

export default function TaskListContainer({ initialFilter }: TaskListContainerProps) {
  const { filteredTasks, isLoading, error, fetchTasks, setFilter } = useTasks()

  useEffect(() => {
    fetchTasks()

    // Apply initial filter if provided
    if (initialFilter) {
      setFilter(initialFilter)
    }
  }, [fetchTasks, initialFilter, setFilter])

  const handleFilterChange = (filter: TaskFilter) => {
    setFilter(filter)
  }

  return (
    <div className="space-y-6">
      <TaskFilterBar onFilterChange={handleFilterChange} initialFilter={initialFilter} />

      {error && <SharedError error={new Error(error)} />}

      <TaskList tasks={filteredTasks} isLoading={isLoading} />
    </div>
  )
}
