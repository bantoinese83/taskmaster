"use client"

import React from "react"
import {
  BarChart,
  PieChart,
  LineChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  Pie,
  Line,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task, WorkflowStatus, SwimlaneProperty } from "@/lib/types"

interface SwimlaneAnalyticsProps {
  tasks: Task[]
  statuses: WorkflowStatus[]
  swimlaneProperty: SwimlaneProperty
}

export function SwimlaneAnalytics({ tasks, statuses, swimlaneProperty }: SwimlaneAnalyticsProps) {
  const [timeRange, setTimeRange] = React.useState("7")

  // Group tasks by swimlane value
  const getSwimlaneData = () => {
    if (swimlaneProperty === "none") return []

    const swimlaneValues: Record<string, { name: string; value: string | null; tasks: Task[] }> = {}

    if (swimlaneProperty === "assignee") {
      // Add "Unassigned" swimlane
      swimlaneValues["unassigned"] = { name: "Unassigned", value: null, tasks: [] }

      // Group by assignee
      tasks.forEach((task) => {
        if (!task.assigneeId) {
          swimlaneValues["unassigned"].tasks.push(task)
        } else {
          if (!swimlaneValues[task.assigneeId]) {
            swimlaneValues[task.assigneeId] = {
              name: task.assignee?.name || `User ${task.assigneeId}`,
              value: task.assigneeId,
              tasks: [],
            }
          }
          swimlaneValues[task.assigneeId].tasks.push(task)
        }
      })
    } else if (swimlaneProperty === "priority") {
      // Group by priority
      tasks.forEach((task) => {
        const priority = task.priority
        if (!swimlaneValues[priority]) {
          swimlaneValues[priority] = {
            name: priority.charAt(0) + priority.slice(1).toLowerCase(),
            value: priority,
            tasks: [],
          }
        }
        swimlaneValues[priority].tasks.push(task)
      })
    } else if (swimlaneProperty === "dueDate") {
      // Group by due date range
      swimlaneValues["overdue"] = { name: "Overdue", value: "overdue", tasks: [] }
      swimlaneValues["today"] = { name: "Due Today", value: "today", tasks: [] }
      swimlaneValues["tomorrow"] = { name: "Due Tomorrow", value: "tomorrow", tasks: [] }
      swimlaneValues["this-week"] = { name: "Due This Week", value: "this-week", tasks: [] }
      swimlaneValues["later"] = { name: "Due Later", value: "later", tasks: [] }
      swimlaneValues["no-date"] = { name: "No Due Date", value: null, tasks: [] }

      tasks.forEach((task) => {
        if (!task.dueDate) {
          swimlaneValues["no-date"].tasks.push(task)
        } else {
          const dueDate = new Date(task.dueDate)
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          const nextWeek = new Date(today)
          nextWeek.setDate(nextWeek.getDate() + 7)

          if (dueDate < today) {
            swimlaneValues["overdue"].tasks.push(task)
          } else if (dueDate.getTime() === today.getTime()) {
            swimlaneValues["today"].tasks.push(task)
          } else if (dueDate.getTime() === tomorrow.getTime()) {
            swimlaneValues["tomorrow"].tasks.push(task)
          } else if (dueDate < nextWeek) {
            swimlaneValues["this-week"].tasks.push(task)
          } else {
            swimlaneValues["later"].tasks.push(task)
          }
        }
      })
    }

    return Object.values(swimlaneValues)
  }

  // Generate task count data for chart
  const generateTaskCountData = () => {
    const swimlaneData = getSwimlaneData()

    return swimlaneData
      .map((lane) => {
        const completedCount = lane.tasks.filter((task) => {
          const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
          return (
            statusObj &&
            (statusObj.name.toLowerCase().includes("done") ||
              statusObj.name.toLowerCase().includes("completed") ||
              statusObj.name.toLowerCase().includes("finished"))
          )
        }).length

        const inProgressCount = lane.tasks.filter((task) => {
          const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
          return (
            statusObj &&
            !statusObj.name.toLowerCase().includes("done") &&
            !statusObj.name.toLowerCase().includes("completed") &&
            !statusObj.name.toLowerCase().includes("finished") &&
            !statusObj.name.toLowerCase().includes("backlog") &&
            !statusObj.name.toLowerCase().includes("todo")
          )
        }).length

        const todoCount = lane.tasks.filter((task) => {
          const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
          return (
            statusObj &&
            (statusObj.name.toLowerCase().includes("backlog") || statusObj.name.toLowerCase().includes("todo"))
          )
        }).length

        return {
          name: lane.name,
          "To Do": todoCount,
          "In Progress": inProgressCount,
          Completed: completedCount,
          Total: lane.tasks.length,
        }
      })
      .sort((a, b) => b.Total - a.Total) // Sort by total tasks descending
  }

  // Generate completion rate data for chart
  const generateCompletionRateData = () => {
    const swimlaneData = getSwimlaneData()

    return swimlaneData
      .map((lane) => {
        const completedCount = lane.tasks.filter((task) => {
          const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
          return (
            statusObj &&
            (statusObj.name.toLowerCase().includes("done") ||
              statusObj.name.toLowerCase().includes("completed") ||
              statusObj.name.toLowerCase().includes("finished"))
          )
        }).length

        const completionRate = lane.tasks.length > 0 ? (completedCount / lane.tasks.length) * 100 : 0

        return {
          name: lane.name,
          "Completion Rate": Math.round(completionRate),
          "Task Count": lane.tasks.length,
        }
      })
      .sort((a, b) => b["Completion Rate"] - a["Completion Rate"]) // Sort by completion rate descending
  }

  // Generate average task age data for chart
  const generateAvgTaskAgeData = () => {
    const swimlaneData = getSwimlaneData()

    return swimlaneData
      .map((lane) => {
        const avgAge =
          lane.tasks.length > 0
            ? Math.round(
                lane.tasks.reduce((sum, task) => {
                  const createdDate = new Date(task.createdAt)
                  const now = new Date()
                  const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                  return sum + ageInDays
                }, 0) / lane.tasks.length,
              )
            : 0

        return {
          name: lane.name,
          "Average Age (days)": avgAge,
          "Task Count": lane.tasks.length,
        }
      })
      .sort((a, b) => b["Average Age (days)"] - a["Average Age (days)"]) // Sort by average age descending
  }

  // Generate status distribution data for pie chart
  const generateStatusDistributionData = () => {
    const statusCounts: Record<string, number> = {}

    tasks.forEach((task) => {
      const statusId = task.statusId || task.status
      const statusObj = statuses.find((s) => s.id === statusId || s.name === statusId)
      const statusName = statusObj ? statusObj.name : String(statusId)

      statusCounts[statusName] = (statusCounts[statusName] || 0) + 1
    })

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }))
  }

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a855f7", "#ec4899", "#06b6d4", "#84cc16", "#f43f5e"]

  const dataByTimeRange = (days: number) => {
    // Filter tasks by time range
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const filteredTasks = tasks.filter((task) => {
      const createdDate = new Date(task.createdAt)
      return createdDate >= cutoffDate
    })

    // Return an empty array if there are no tasks
    if (filteredTasks.length === 0) return []

    // Group by date
    const tasksByDate: Record<string, { date: string; count: number }> = {}

    for (let i = 0; i <= days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const dateString = date.toISOString().split("T")[0]
      tasksByDate[dateString] = { date: dateString, count: 0 }
    }

    filteredTasks.forEach((task) => {
      const createdDate = new Date(task.createdAt)
      createdDate.setHours(0, 0, 0, 0)

      const dateString = createdDate.toISOString().split("T")[0]

      if (tasksByDate[dateString]) {
        tasksByDate[dateString].count++
      }
    })

    return Object.values(tasksByDate)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count: item.count,
      }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Swimlane Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution by Swimlane</CardTitle>
            <CardDescription>
              {swimlaneProperty === "assignee"
                ? "Tasks assigned to each team member"
                : swimlaneProperty === "priority"
                  ? "Tasks distributed by priority level"
                  : swimlaneProperty === "dueDate"
                    ? "Tasks categorized by due date status"
                    : "Task distribution across swimlanes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={generateTaskCountData()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 60,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={90} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="To Do" stackId="a" fill="#FFBB28" />
                  <Bar dataKey="In Progress" stackId="a" fill="#0088FE" />
                  <Bar dataKey="Completed" stackId="a" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Rate by Swimlane</CardTitle>
            <CardDescription>Percentage of completed tasks in each swimlane</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={generateCompletionRateData()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" orientation="left" stroke="#0088FE" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#FF8042" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Completion Rate" fill="#0088FE" />
                  <Bar yAxisId="right" dataKey="Task Count" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Task Age by Swimlane</CardTitle>
            <CardDescription>Average number of days tasks have been in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={generateAvgTaskAgeData()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" orientation="left" stroke="#00C49F" />
                  <YAxis yAxisId="right" orientation="right" stroke="#FF8042" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Average Age (days)" fill="#00C49F" />
                  <Bar yAxisId="right" dataKey="Task Count" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Tasks distributed across workflow statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={generateStatusDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {generateStatusDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tasks Created Over Time</CardTitle>
          <CardDescription>Number of tasks created each day over the last {timeRange} days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dataByTimeRange(Number.parseInt(timeRange))}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Tasks Created" stroke="#0088FE" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
