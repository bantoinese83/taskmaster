"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { TASK_PRIORITY } from "@/lib/constants"
import type { Task } from "@/lib/types"

interface ColumnDistributionChartProps {
  columnId: string
  columnName: string
  columnColor: string
  tasks: Task[]
}

export function ColumnDistributionChart({ columnId, columnName, columnColor, tasks }: ColumnDistributionChartProps) {
  // Generate priority distribution data
  const priorityData = useMemo(() => {
    const distribution: Record<string, number> = {}

    // Initialize with all priorities
    Object.values(TASK_PRIORITY).forEach((priority) => {
      const label = priority.charAt(0) + priority.slice(1).toLowerCase()
      distribution[label] = 0
    })

    // Count tasks by priority
    tasks.forEach((task) => {
      const priority = task.priority.charAt(0) + task.priority.slice(1).toLowerCase()
      distribution[priority] = (distribution[priority] || 0) + 1
    })

    // Convert to array format for chart
    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }))
  }, [tasks])

  // Generate assignee distribution data
  const assigneeData = useMemo(() => {
    const distribution: Record<string, number> = {
      Unassigned: 0,
    }

    // Count tasks by assignee
    tasks.forEach((task) => {
      const assignee = task.assignee?.name || "Unassigned"
      distribution[assignee] = (distribution[assignee] || 0) + 1
    })

    // Convert to array format for chart
    return Object.entries(distribution)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((a, b) => b.value - a.value) // Sort by count descending
  }, [tasks])

  // Generate due date distribution data
  const dueDateData = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(now)
    nextWeek.setDate(nextWeek.getDate() + 7)

    const distribution = [
      { name: "Overdue", value: 0 },
      { name: "Today", value: 0 },
      { name: "This Week", value: 0 },
      { name: "Later", value: 0 },
      { name: "No Date", value: 0 },
    ]

    // Count tasks by due date
    tasks.forEach((task) => {
      if (!task.dueDate) {
        distribution[4].value++
      } else {
        const dueDate = new Date(task.dueDate)

        if (dueDate < now) {
          distribution[0].value++
        } else if (dueDate.getTime() === now.getTime()) {
          distribution[1].value++
        } else if (dueDate < nextWeek) {
          distribution[2].value++
        } else {
          distribution[3].value++
        }
      }
    })

    return distribution.filter((item) => item.value > 0)
  }, [tasks])

  // Colors for priority chart
  const PRIORITY_COLORS = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#3b82f6",
  }

  // Colors for due date chart
  const DUE_DATE_COLORS = {
    Overdue: "#ef4444",
    Today: "#f59e0b",
    "This Week": "#3b82f6",
    Later: "#22c55e",
    "No Date": "#94a3b8",
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Priority Distribution</CardTitle>
            <CardDescription>Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {tasks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || columnColor}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">No tasks available</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Due Date Distribution</CardTitle>
            <CardDescription>Tasks by due date status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {tasks.length > 0 && dueDateData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dueDateData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dueDateData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={DUE_DATE_COLORS[entry.name as keyof typeof DUE_DATE_COLORS] || columnColor}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No due date data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignee Distribution</CardTitle>
          <CardDescription>Tasks by assignee</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {tasks.length > 0 && assigneeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={assigneeData.slice(0, 5)} // Show top 5 assignees
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill={columnColor} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No assignee data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
