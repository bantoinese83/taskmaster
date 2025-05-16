"use client"

import type React from "react"
import { useState } from "react"
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Percent,
  PieChart,
  ChevronRight,
  ChevronLeft,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Task, WorkflowStatus } from "@/lib/types"

interface SwimlaneStatisticsProps {
  swimlaneId: string
  swimlaneName: string
  tasks: Task[]
  statuses: WorkflowStatus[]
}

export function SwimlaneStatistics({ swimlaneId, swimlaneName, tasks, statuses }: SwimlaneStatisticsProps) {
  const [currentMetric, setCurrentMetric] = useState<number>(0)

  // Define the metrics to display
  const metrics = [
    { name: "Task Count", icon: <BarChart3 className="h-4 w-4" /> },
    { name: "Completion Rate", icon: <Percent className="h-4 w-4" /> },
    { name: "Avg Time", icon: <Clock className="h-4 w-4" /> },
    { name: "Distribution", icon: <PieChart className="h-4 w-4" /> },
  ]

  // Calculate metrics
  const completedTasks = tasks.filter((task) => {
    const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
    // Consider a task completed if it's in a status with "done", "completed", or "finished" in the name
    return (
      statusObj &&
      (statusObj.name.toLowerCase().includes("done") ||
        statusObj.name.toLowerCase().includes("completed") ||
        statusObj.name.toLowerCase().includes("finished"))
    )
  })

  const inProgressTasks = tasks.filter((task) => {
    const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
    return (
      statusObj &&
      !statusObj.name.toLowerCase().includes("done") &&
      !statusObj.name.toLowerCase().includes("completed") &&
      !statusObj.name.toLowerCase().includes("finished") &&
      !statusObj.name.toLowerCase().includes("backlog") &&
      !statusObj.name.toLowerCase().includes("todo")
    )
  })

  const todoTasks = tasks.filter((task) => {
    const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
    return (
      statusObj && (statusObj.name.toLowerCase().includes("backlog") || statusObj.name.toLowerCase().includes("todo"))
    )
  })

  const blockedTasks = tasks.filter((task) => {
    const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
    return statusObj && statusObj.name.toLowerCase().includes("blocked")
  })

  const overdueTasksCount = tasks.filter((task) => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return dueDate < today && !completedTasks.includes(task)
  }).length

  // Calculate completion rate as a percentage
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  // Calculate average task age in days
  const avgTaskAge =
    tasks.length > 0
      ? Math.round(
          tasks.reduce((sum, task) => {
            const createdDate = new Date(task.createdAt)
            const now = new Date()
            const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
            return sum + ageInDays
          }, 0) / tasks.length,
        )
      : 0

  // Calculate time distribution across statuses
  const tasksByStatus = statuses
    .map((status) => {
      const statusTasks = tasks.filter((task) => task.statusId === status.id || task.status === status.name)
      return {
        status,
        count: statusTasks.length,
        percentage: tasks.length > 0 ? Math.round((statusTasks.length / tasks.length) * 100) : 0,
      }
    })
    .filter((item) => item.count > 0)

  // Calculate priority distribution
  const priorityCounts: Record<string, number> = {}
  tasks.forEach((task) => {
    const priority = task.priority
    priorityCounts[priority] = (priorityCounts[priority] || 0) + 1
  })

  const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
    priority,
    count,
    percentage: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0,
  }))

  // Navigate between metrics
  const nextMetric = () => {
    setCurrentMetric((prev) => (prev + 1) % metrics.length)
  }

  const prevMetric = () => {
    setCurrentMetric((prev) => (prev - 1 + metrics.length) % metrics.length)
  }

  // Functions to render different metric displays
  const renderTaskCount = () => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Total Tasks</span>
        <span className="text-sm font-bold">{tasks.length}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
          <div className="rounded-full p-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="h-3 w-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">Completed</span>
            <span className="text-sm font-bold">{completedTasks.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
          <div className="rounded-full p-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <Clock className="h-3 w-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">In Progress</span>
            <span className="text-sm font-bold">{inProgressTasks.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
          <div className="rounded-full p-1 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <ChevronRight className="h-3 w-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">To Do</span>
            <span className="text-sm font-bold">{todoTasks.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
          <div className="rounded-full p-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
            <AlertTriangle className="h-3 w-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium">Blocked</span>
            <span className="text-sm font-bold">{blockedTasks.length}</span>
          </div>
        </div>
      </div>
      {overdueTasksCount > 0 && (
        <div className="mt-2 p-2 rounded bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3" />
            <span>
              {overdueTasksCount} overdue {overdueTasksCount === 1 ? "task" : "tasks"}
            </span>
          </div>
        </div>
      )}
    </div>
  )

  const renderCompletionRate = () => (
    <div className="space-y-3">
      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <svg className="w-24 h-24" viewBox="0 0 100 100">
            <circle
              className="text-muted-foreground/20 stroke-current"
              strokeWidth="10"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className={cn(
                "stroke-current",
                completionRate >= 75
                  ? "text-green-500"
                  : completionRate >= 50
                    ? "text-blue-500"
                    : completionRate >= 25
                      ? "text-amber-500"
                      : "text-red-500",
              )}
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              strokeDasharray={`${(2 * Math.PI * 40 * completionRate) / 100} ${(2 * Math.PI * 40 * (100 - completionRate)) / 100}`}
              strokeDashoffset={(2 * Math.PI * 40 * 25) / 100}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{completionRate}%</span>
          </div>
        </div>
        <span className="text-sm font-medium mt-3">Completion Rate</span>
      </div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <div className="flex justify-between items-center px-2 py-1 bg-muted/30 rounded">
          <span>Completed</span>
          <span className="font-medium">{completedTasks.length}</span>
        </div>
        <div className="flex justify-between items-center px-2 py-1 bg-muted/30 rounded">
          <span>Total</span>
          <span className="font-medium">{tasks.length}</span>
        </div>
      </div>
    </div>
  )

  const renderAvgTime = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="text-center">
          <div className="text-2xl font-bold">{avgTaskAge}</div>
          <div className="text-xs text-muted-foreground">days average</div>
        </div>
        <div className="h-10 w-px bg-muted" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "text-center cursor-help",
                  avgTaskAge > 14 ? "text-red-500" : avgTaskAge > 7 ? "text-amber-500" : "text-green-500",
                )}
              >
                <div className="text-2xl font-bold flex items-center gap-1">
                  {avgTaskAge > 14 ? "High" : avgTaskAge > 7 ? "Medium" : "Low"}
                  <Info className="h-4 w-4" />
                </div>
                <div className="text-xs">age indicator</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                {avgTaskAge > 14
                  ? "Tasks are aging significantly. Consider addressing bottlenecks."
                  : avgTaskAge > 7
                    ? "Task age is moderate. Monitor for potential bottlenecks."
                    : "Task flow is healthy with low average age."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span>Age Distribution</span>
          <span className="text-muted-foreground">(task count)</span>
        </div>
        <div className="space-y-1">
          {[
            {
              label: "< 3 days",
              count: tasks.filter((task) => {
                const createdDate = new Date(task.createdAt)
                const now = new Date()
                const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                return ageInDays < 3
              }).length,
            },
            {
              label: "3-7 days",
              count: tasks.filter((task) => {
                const createdDate = new Date(task.createdAt)
                const now = new Date()
                const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                return ageInDays >= 3 && ageInDays < 7
              }).length,
            },
            {
              label: "1-2 weeks",
              count: tasks.filter((task) => {
                const createdDate = new Date(task.createdAt)
                const now = new Date()
                const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                return ageInDays >= 7 && ageInDays < 14
              }).length,
            },
            {
              label: "> 2 weeks",
              count: tasks.filter((task) => {
                const createdDate = new Date(task.createdAt)
                const now = new Date()
                const ageInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
                return ageInDays >= 14
              }).length,
            },
          ].map((range, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="w-16">{range.label}</span>
              <Progress value={tasks.length > 0 ? (range.count / tasks.length) * 100 : 0} className="h-2" />
              <span className="w-8 text-right">{range.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderDistribution = () => (
    <div className="space-y-3">
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="status" className="text-xs">
            By Status
          </TabsTrigger>
          <TabsTrigger value="priority" className="text-xs">
            By Priority
          </TabsTrigger>
        </TabsList>
        <TabsContent value="status" className="space-y-2 mt-2">
          {tasksByStatus.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.status.color || "#3b82f6" }} />
                  <span>{item.status.name}</span>
                </div>
                <span>
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <Progress
                value={item.percentage}
                className="h-1"
                style={
                  {
                    "--tw-progress-bar-color": `${item.status.color}40`,
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </TabsContent>
        <TabsContent value="priority" className="space-y-2 mt-2">
          {priorityDistribution.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        item.priority === "HIGH" ? "#ef4444" : item.priority === "MEDIUM" ? "#f59e0b" : "#3b82f6",
                    }}
                  />
                  <span>{item.priority.charAt(0) + item.priority.slice(1).toLowerCase()}</span>
                </div>
                <span>
                  {item.count} ({item.percentage}%)
                </span>
              </div>
              <Progress
                value={item.percentage}
                className="h-1"
                style={
                  {
                    "--tw-progress-bar-color":
                      item.priority === "HIGH"
                        ? "rgba(239, 68, 68, 0.25)"
                        : item.priority === "MEDIUM"
                          ? "rgba(245, 158, 11, 0.25)"
                          : "rgba(59, 130, 246, 0.25)",
                  } as React.CSSProperties
                }
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )

  const renderCurrentMetric = () => {
    switch (currentMetric) {
      case 0:
        return renderTaskCount()
      case 1:
        return renderCompletionRate()
      case 2:
        return renderAvgTime()
      case 3:
        return renderDistribution()
      default:
        return renderTaskCount()
    }
  }

  // Compact version for display in swimlane header
  const renderCompactMetrics = () => {
    return (
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="rounded-full p-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="h-3 w-3" />
          </div>
          <span>
            {completedTasks.length}/{tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Percent className="h-3 w-3" />
          <span>{completionRate}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>~{avgTaskAge}d</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Compact metrics for swimlane header */}
      <div className="hidden sm:block">{renderCompactMetrics()}</div>

      {/* Detailed metrics in popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <BarChart3 className="h-4 w-4" />
            <span className="sr-only">Swimlane Statistics</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">{swimlaneName} Metrics</h4>
              <div className="flex items-center text-muted-foreground">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prevMetric}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous metric</span>
                </Button>
                <div className="flex items-center justify-center gap-1.5 w-24">
                  {metrics[currentMetric].icon}
                  <span className="text-xs">{metrics[currentMetric].name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={nextMetric}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Next metric</span>
                </Button>
              </div>
            </div>

            {renderCurrentMetric()}

            <div className="pt-2 border-t text-xs text-muted-foreground flex justify-between items-center">
              <span>Total tasks: {tasks.length}</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                View detailed report
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
