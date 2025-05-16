"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTasks } from "@/lib/hooks/use-tasks"
import { useUsers } from "@/lib/hooks/use-users"
import { TaskStatusChart } from "@/components/analytics/task-status-chart"
import { TaskPriorityChart } from "@/components/analytics/task-priority-chart"
import { TaskCompletionChart } from "@/components/analytics/task-completion-chart"
import { TaskAssigneeChart } from "@/components/analytics/task-assignee-chart"
import { TaskTrendChart } from "@/components/analytics/task-trend-chart"
import { TaskMetricsGrid } from "@/components/analytics/task-metrics-grid"
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants"

export default function AnalyticsDashboard() {
  const { tasks, isLoading, fetchTasks } = useTasks()
  const { users } = useUsers()
  const [completedTasksByDay, setCompletedTasksByDay] = useState<{ date: string; count: number }[]>([])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    // Calculate completed tasks by day for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    const completedByDay = last30Days.map((date) => {
      const count = tasks.filter((task) => {
        if (task.status !== TASK_STATUS.COMPLETED) return false
        const updatedDate = new Date(task.updatedAt).toISOString().split("T")[0]
        return updatedDate === date
      }).length

      return {
        date,
        count,
      }
    })

    setCompletedTasksByDay(completedByDay)
  }, [tasks])

  // Calculate metrics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === TASK_STATUS.COMPLETED).length
  const inProgressTasks = tasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS).length
  const todoTasks = tasks.filter((task) => task.status === TASK_STATUS.TODO).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const highPriorityTasks = tasks.filter((task) => task.priority === TASK_PRIORITY.HIGH).length
  const mediumPriorityTasks = tasks.filter((task) => task.priority === TASK_PRIORITY.MEDIUM).length
  const lowPriorityTasks = tasks.filter((task) => task.priority === TASK_PRIORITY.LOW).length

  // Calculate overdue tasks
  const today = new Date()
  const overdueTasks = tasks.filter((task) => {
    if (task.status === TASK_STATUS.COMPLETED || !task.dueDate) return false
    return new Date(task.dueDate) < today
  }).length

  // Calculate tasks by assignee
  const tasksByAssignee = users
    .map((user) => {
      const assignedTasks = tasks.filter((task) => task.assigneeId === user.id).length
      return {
        name: user.name,
        value: assignedTasks,
      }
    })
    .filter((item) => item.value > 0)

  // Add unassigned tasks
  const unassignedTasks = tasks.filter((task) => !task.assigneeId).length
  if (unassignedTasks > 0) {
    tasksByAssignee.push({
      name: "Unassigned",
      value: unassignedTasks,
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <TaskMetricsGrid
        totalTasks={totalTasks}
        completedTasks={completedTasks}
        inProgressTasks={inProgressTasks}
        todoTasks={todoTasks}
        overdueTasks={overdueTasks}
        completionRate={completionRate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Status Distribution</CardTitle>
            <CardDescription>Breakdown of tasks by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <TaskStatusChart
                todoTasks={todoTasks}
                inProgressTasks={inProgressTasks}
                completedTasks={completedTasks}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
            <CardDescription>Breakdown of tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <TaskPriorityChart
                highPriorityTasks={highPriorityTasks}
                mediumPriorityTasks={mediumPriorityTasks}
                lowPriorityTasks={lowPriorityTasks}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="completion">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="completion">Completion Rate</TabsTrigger>
          <TabsTrigger value="assignees">Tasks by Assignee</TabsTrigger>
          <TabsTrigger value="trend">Completion Trend</TabsTrigger>
        </TabsList>

        <TabsContent value="completion">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Rate</CardTitle>
              <CardDescription>Percentage of completed tasks vs. total tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <TaskCompletionChart completionRate={completionRate} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignees">
          <Card>
            <CardHeader>
              <CardTitle>Tasks by Assignee</CardTitle>
              <CardDescription>Distribution of tasks among team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <TaskAssigneeChart tasksByAssignee={tasksByAssignee} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trend</CardTitle>
              <CardDescription>Number of tasks completed over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <TaskTrendChart completedTasksByDay={completedTasksByDay} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
