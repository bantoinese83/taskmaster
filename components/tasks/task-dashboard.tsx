"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { TaskSummary } from "@/components/tasks/task-summary"
import { TaskCard } from "@/components/tasks/task-card"
import { useTasks } from "@/lib/hooks/use-tasks"
import { useAuth } from "@/lib/hooks/use-auth"
import { ROUTES, TASK_STATUS } from "@/lib/constants"

export default function TaskDashboard() {
  const { user } = useAuth()
  const { tasks, isLoading, error, fetchTasks, getTasksByStatus, getTasksDueSoon, getOverdueTasks } = useTasks()

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const todoTasks = getTasksByStatus(TASK_STATUS.TODO)
  const inProgressTasks = getTasksByStatus(TASK_STATUS.IN_PROGRESS)
  const completedTasks = getTasksByStatus(TASK_STATUS.COMPLETED)
  const dueSoonTasks = getTasksDueSoon(3)
  const overdueTasks = getOverdueTasks()

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>
        <Button asChild>
          <Link href={ROUTES.NEW_TASK}>
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
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
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
                <Link href={ROUTES.TASKS}>View All Tasks</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Tasks</CardTitle>
              <CardDescription>Tasks that are past their due date</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : overdueTasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overdueTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No overdue tasks</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={ROUTES.TASKS}>View All Tasks</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
