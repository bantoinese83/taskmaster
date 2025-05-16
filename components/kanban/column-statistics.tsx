"use client"

import type React from "react"

import { useState } from "react"
import { Clock, BarChart2, ArrowRight, Users, AlertTriangle } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { Task, WorkflowStatus } from "@/lib/types"

interface ColumnStatisticsProps {
  columnId: string
  columnName: string
  columnColor: string
  tasks: Task[]
  status?: WorkflowStatus
  isLoading?: boolean
}

interface TimeMetric {
  average: string
  min: string
  max: string
  median: string
}

interface ColumnMetrics {
  timeInColumn: TimeMetric
  taskCount: number
  completionRate: number
  blockedTasks: number
  overdueCount: number
  assigneeDistribution: Record<string, number>
  priorityDistribution: Record<string, number>
}

export function ColumnStatistics({
  columnId,
  columnName,
  columnColor,
  tasks,
  status,
  isLoading = false,
}: ColumnStatisticsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate metrics
  const metrics: ColumnMetrics = calculateMetrics(tasks)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <BarChart2 className="h-4 w-4" />
          <span className="sr-only">Column Statistics</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2" style={{ backgroundColor: `${columnColor}15` }}>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: columnColor }} />
              {columnName} Statistics
            </CardTitle>
            <CardDescription>Metrics and insights for this column</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="time" className="flex-1">
                  Time
                </TabsTrigger>
                <TabsTrigger value="people" className="flex-1">
                  People
                </TabsTrigger>
              </TabsList>

              {isLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <>
                  <TabsContent value="overview" className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <StatCard
                        title="Tasks"
                        value={metrics.taskCount.toString()}
                        icon={<BarChart2 className="h-4 w-4" />}
                      />
                      <StatCard
                        title="Avg. Time"
                        value={metrics.timeInColumn.average}
                        icon={<Clock className="h-4 w-4" />}
                      />
                      <StatCard
                        title="Completion"
                        value={`${metrics.completionRate}%`}
                        icon={<ArrowRight className="h-4 w-4" />}
                      />
                      <StatCard
                        title="Blocked"
                        value={metrics.blockedTasks.toString()}
                        icon={<AlertTriangle className="h-4 w-4" />}
                        alert={metrics.blockedTasks > 0}
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Priority Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(metrics.priorityDistribution).map(([priority, count]) => (
                          <div key={priority} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{priority}</span>
                              <span>
                                {count} tasks ({Math.round((count / metrics.taskCount) * 100)}%)
                              </span>
                            </div>
                            <Progress value={(count / metrics.taskCount) * 100} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="time" className="p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Time in Column</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <StatCard
                          title="Average"
                          value={metrics.timeInColumn.average}
                          icon={<Clock className="h-4 w-4" />}
                        />
                        <StatCard
                          title="Median"
                          value={metrics.timeInColumn.median}
                          icon={<Clock className="h-4 w-4" />}
                        />
                        <StatCard
                          title="Minimum"
                          value={metrics.timeInColumn.min}
                          icon={<Clock className="h-4 w-4" />}
                        />
                        <StatCard
                          title="Maximum"
                          value={metrics.timeInColumn.max}
                          icon={<Clock className="h-4 w-4" />}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Due Date Status</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="rounded-sm">
                          {metrics.overdueCount} overdue
                        </Badge>
                        <Badge variant="outline" className="rounded-sm">
                          {tasks.filter((t) => t.dueDate).length - metrics.overdueCount} on track
                        </Badge>
                        <Badge variant="secondary" className="rounded-sm">
                          {tasks.filter((t) => !t.dueDate).length} no date
                        </Badge>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="people" className="p-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Assignee Distribution</h4>
                      <div className="space-y-2">
                        {Object.entries(metrics.assigneeDistribution).length > 0 ? (
                          Object.entries(metrics.assigneeDistribution).map(([assignee, count]) => (
                            <div key={assignee} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>{assignee === "unassigned" ? "Unassigned" : assignee}</span>
                                <span>
                                  {count} tasks ({Math.round((count / metrics.taskCount) * 100)}%)
                                </span>
                              </div>
                              <Progress value={(count / metrics.taskCount) * 100} className="h-1.5" />
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-muted-foreground">No assignee data available</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Workload Balance</h4>
                      <div className="text-sm text-muted-foreground">
                        {Object.keys(metrics.assigneeDistribution).length > 1 ? (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              Tasks distributed across {Object.keys(metrics.assigneeDistribution).length}
                              {Object.keys(metrics.assigneeDistribution).includes("unassigned") ? " people" : " people"}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span>All tasks assigned to one person</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

// Helper component for stat cards
function StatCard({
  title,
  value,
  icon,
  alert = false,
}: {
  title: string
  value: string
  icon: React.ReactNode
  alert?: boolean
}) {
  return (
    <div className={`p-2 rounded-md border ${alert ? "border-destructive/50 bg-destructive/10" : "border-border"}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium">{title}</span>
        {icon}
      </div>
      <div className={`text-lg font-semibold ${alert ? "text-destructive" : ""}`}>{value}</div>
    </div>
  )
}

// Helper function to calculate metrics
function calculateMetrics(tasks: Task[]): ColumnMetrics {
  // Mock data for now - in a real implementation, this would use actual task history data
  const now = new Date()

  // Calculate time in column metrics
  const timeInColumnDays = tasks
    .map((task) => {
      const createdAt = new Date(task.createdAt)
      const diffTime = Math.abs(now.getTime() - createdAt.getTime())
      return diffTime / (1000 * 60 * 60 * 24) // convert to days
    })
    .sort((a, b) => a - b)

  const average =
    timeInColumnDays.length > 0 ? timeInColumnDays.reduce((sum, time) => sum + time, 0) / timeInColumnDays.length : 0

  const min = timeInColumnDays.length > 0 ? timeInColumnDays[0] : 0
  const max = timeInColumnDays.length > 0 ? timeInColumnDays[timeInColumnDays.length - 1] : 0
  const median = timeInColumnDays.length > 0 ? timeInColumnDays[Math.floor(timeInColumnDays.length / 2)] : 0

  // Format time values
  const formatTime = (days: number): string => {
    if (days < 1) {
      return `${Math.round(days * 24)}h`
    }
    return `${Math.round(days)}d`
  }

  // Calculate priority distribution
  const priorityDistribution: Record<string, number> = {}
  tasks.forEach((task) => {
    const priority = task.priority.charAt(0) + task.priority.slice(1).toLowerCase()
    priorityDistribution[priority] = (priorityDistribution[priority] || 0) + 1
  })

  // Calculate assignee distribution
  const assigneeDistribution: Record<string, number> = {}
  tasks.forEach((task) => {
    const assignee = task.assignee?.name || "unassigned"
    assigneeDistribution[assignee] = (assigneeDistribution[assignee] || 0) + 1
  })

  // Calculate overdue tasks
  const overdueCount = tasks.filter((task) => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    return dueDate < now
  }).length

  // Mock completion rate and blocked tasks for demonstration
  const completionRate = tasks.length > 0 ? Math.round(Math.random() * 100) : 0
  const blockedTasks = Math.round(tasks.length * 0.1) // 10% of tasks are blocked (mock data)

  return {
    timeInColumn: {
      average: formatTime(average),
      min: formatTime(min),
      max: formatTime(max),
      median: formatTime(median),
    },
    taskCount: tasks.length,
    completionRate,
    blockedTasks,
    overdueCount,
    assigneeDistribution,
    priorityDistribution,
  }
}
