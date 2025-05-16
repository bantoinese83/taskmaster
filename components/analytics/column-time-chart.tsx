"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { Task } from "@/lib/types"

interface ColumnTimeChartProps {
  columnId: string
  columnName: string
  columnColor: string
  tasks: Task[]
}

export function ColumnTimeChart({ columnId, columnName, columnColor, tasks }: ColumnTimeChartProps) {
  // Generate mock data for time in column
  const timeData = useMemo(() => {
    // In a real implementation, this would use actual task history data
    const now = new Date()

    // Calculate days in column for each task
    const taskTimes = tasks.map((task) => {
      const createdAt = new Date(task.createdAt)
      const diffTime = Math.abs(now.getTime() - createdAt.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return {
        id: task.id,
        title: task.title,
        days: diffDays,
      }
    })

    // Group tasks by time ranges
    const ranges = [
      { name: "< 1 day", count: 0 },
      { name: "1-2 days", count: 0 },
      { name: "3-7 days", count: 0 },
      { name: "1-2 weeks", count: 0 },
      { name: "> 2 weeks", count: 0 },
    ]

    taskTimes.forEach((task) => {
      if (task.days < 1) {
        ranges[0].count++
      } else if (task.days <= 2) {
        ranges[1].count++
      } else if (task.days <= 7) {
        ranges[2].count++
      } else if (task.days <= 14) {
        ranges[3].count++
      } else {
        ranges[4].count++
      }
    })

    return ranges
  }, [tasks])

  // Calculate average time in column
  const averageTime = useMemo(() => {
    if (tasks.length === 0) return "N/A"

    const now = new Date()
    let totalDays = 0

    tasks.forEach((task) => {
      const createdAt = new Date(task.createdAt)
      const diffTime = Math.abs(now.getTime() - createdAt.getTime())
      const diffDays = diffTime / (1000 * 60 * 60 * 24)
      totalDays += diffDays
    })

    const avg = totalDays / tasks.length

    if (avg < 1) {
      return `${Math.round(avg * 24)} hours`
    }
    return `${avg.toFixed(1)} days`
  }, [tasks])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageTime}</div>
            <p className="text-xs text-muted-foreground">Time spent in this column</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Oldest Task</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.length > 0
                ? `${Math.max(
                    ...tasks.map((t) => {
                      const createdAt = new Date(t.createdAt)
                      const diffTime = Math.abs(new Date().getTime() - createdAt.getTime())
                      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    }),
                  )} days`
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Longest time in column</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Task Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">Total tasks in column</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Time Distribution</CardTitle>
          <CardDescription>How long tasks have been in this column</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Tasks" fill={columnColor} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
