"use client"

import type React from "react"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { useTasks } from "@/lib/hooks/use-tasks"
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, ROUTES, statusColorMap, priorityColorMap } from "@/lib/constants"
import type { Task } from "@/lib/types"

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { deleteTask } = useTasks()

  const isCreator = user?.id === task.creatorId

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await deleteTask(task.id)
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(ROUTES.EDIT_TASK(task.id))
  }

  // Get color classes based on status and priority
  const statusColor = statusColorMap[task.status]
  const priorityColor = priorityColorMap[task.priority]

  return (
    <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            <Link href={ROUTES.TASK_DETAIL(task.id)} className="hover:underline">
              {task.title}
            </Link>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge
              className={`bg-${statusColor.light} text-${statusColor.text} dark:bg-${statusColor.dark} dark:text-${statusColor.light}`}
            >
              {TASK_STATUS_LABELS[task.status]}
            </Badge>

            {isCreator && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{task.description || "No description"}</p>

        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`bg-${priorityColor.light} text-${priorityColor.text} dark:bg-${priorityColor.dark} dark:text-${priorityColor.light}`}
          >
            {TASK_PRIORITY_LABELS[task.priority]} Priority
          </Badge>

          {task.dueDate && (
            <span className="text-xs text-muted-foreground">
              Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t">
        <div className="flex items-center space-x-2">
          {task.assignee ? (
            <>
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.image || ""} alt={task.assignee.name || ""} />
                <AvatarFallback className="text-xs">
                  {task.assignee.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">Assigned to {task.assignee.name}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Unassigned</span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
