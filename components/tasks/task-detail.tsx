"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"
import { useSession } from "next-auth/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Trash2, Clock, Flag, User, MessageSquare, Info } from "lucide-react"
import { CommentList } from "@/components/comments/comment-list"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/lib/types"

interface TaskDetailProps {
  task: Task
}

export default function TaskDetail({ task }: TaskDetailProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const statusColors = {
    TODO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  }

  const priorityColors = {
    LOW: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    MEDIUM: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    HIGH: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted",
      })

      router.push("/tasks")
      router.refresh()
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const isCreator = session?.user?.id === task.creatorId

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={statusColors[task.status]}>{task.status.replace("_", " ")}</Badge>
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {task.priority} Priority
              </Badge>
            </div>
          </div>

          {isCreator && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => router.push(`/tasks/${task.id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex items-center gap-1">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the task.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>

      <Tabs defaultValue="details">
        <TabsList className="px-6">
          <TabsTrigger value="details" className="flex items-center gap-1">
            <Info className="h-4 w-4" />
            Details
          </TabsTrigger>
          <TabsTrigger value="comments" className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="p-6 pt-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Description</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {task.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Due Date</p>
                  {task.dueDate ? (
                    <div className="text-sm text-muted-foreground">
                      <p>{format(new Date(task.dueDate), "PPP")}</p>
                      <p>
                        {formatDistanceToNow(new Date(task.dueDate), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No due date</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <p className="text-sm text-muted-foreground">{task.priority} Priority</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Assignee</p>
                  {task.assignee ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.assignee.image || ""} alt={task.assignee.name || ""} />
                        <AvatarFallback className="text-xs">
                          {task.assignee.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{task.assignee.name}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Unassigned</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comments" className="p-6 pt-4">
          <CommentList taskId={task.id} />
        </TabsContent>
      </Tabs>

      <CardFooter className="border-t pt-6 flex flex-col items-start">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={task.creator?.image || ""} alt={task.creator?.name || ""} />
            <AvatarFallback>
              {task.creator?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm">Created by {task.creator?.name}</p>
            <p className="text-xs text-muted-foreground">{format(new Date(task.createdAt), "PPP")}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
