"use client"

import { TaskCard } from "@/components/tasks/task-card"
import { TaskListSkeleton } from "@/components/tasks/task-list-skeleton"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/lib/constants"
import type { Task } from "@/lib/types"

interface TaskListProps {
  tasks: Task[]
  isLoading?: boolean
}

export default function TaskList({ tasks, isLoading = false }: TaskListProps) {
  if (isLoading) {
    return <TaskListSkeleton />
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 space-y-4">
        <h3 className="text-lg font-medium">No tasks found</h3>
        <p className="text-muted-foreground">Try changing your filters or create a new task</p>
        <Button asChild>
          <Link href={ROUTES.NEW_TASK}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Task
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
