"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { TaskSummary } from "@/components/tasks/task-summary"
import { TaskCard } from "@/components/tasks/task-card"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/lib/types"

export default function TaskDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("/api/tasks")
        if (!response.ok) {
          throw new Error("Failed to fetch tasks")
        }
        const data = await response.json()
        setTasks(data)
      } catch (error) {
        console.error("Error fetching tasks:", error)
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [toast])

  const todoTasks = tasks.filter((task) => task.status === "TODO")
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS")
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED")

  const dueSoonTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === "COMPLETED") return false
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  })

  const highPriorityTasks = tasks.filter((task) => task.priority === "HIGH" && task.status !== "COMPLETED")

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskSummary
          title="To Do"
          count={todoTasks.length}
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          color="blue"
        />
        <TaskSummary
          title="In Progress"
          count={inProgressTasks.length}
          icon={<AlertCircle className="h-5 w-5 text-yellow-500" />}
          color="yellow"
        />
        <TaskSummary
          title="Completed"
          count={completedTasks.length}
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          color="green"
        />
      </div>

      <Tabs defaultValue="due-soon">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="due-soon">Due Soon</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority</TabsTrigger>
        </TabsList>
        <TabsContent value="due-soon">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Due Soon</CardTitle>
              <CardDescription>Tasks that are due within the next 3 days</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : dueSoonTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dueSoonTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No tasks due soon</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/tasks?status=TODO">View All Tasks</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="high-priority">
          <Card>
            <CardHeader>
              <CardTitle>High Priority Tasks</CardTitle>
              <CardDescription>Tasks that require immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : highPriorityTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {highPriorityTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No high priority tasks</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/tasks">View All Tasks</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
