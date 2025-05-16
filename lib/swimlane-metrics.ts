import type { Task, WorkflowStatus } from "@/lib/types"

export interface SwimlaneMetrics {
  completedTasks: Task[]
  inProgressTasks: Task[]
  todoTasks: Task[]
  blockedTasks: Task[]
  completionRate: number
  avgTime: number
  distribution: Record<string, number>
}

export function calculateSwimlaneMetrics(tasks: Task[], statuses: WorkflowStatus[]): SwimlaneMetrics {
  // Calculate completed tasks
  const completedTasks = tasks.filter((task) => {
    const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
    return (
      statusObj &&
      (statusObj.name.toLowerCase().includes("done") ||
        statusObj.name.toLowerCase().includes("completed") ||
        statusObj.name.toLowerCase().includes("finished"))
    )
  })

  // Calculate in-progress tasks
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

  // Calculate todo tasks
  const todoTasks = tasks.filter((task) => {
    const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
    return (
      statusObj && (statusObj.name.toLowerCase().includes("backlog") || statusObj.name.toLowerCase().includes("todo"))
    )
  })

  // Calculate blocked tasks
  const blockedTasks = tasks.filter((task) => {
    const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
    return statusObj && statusObj.name.toLowerCase().includes("blocked")
  })

  // Completion rate
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

  // Average time (dummy, as original code does not provide time calculation)
  const avgTime = 0

  // Distribution by status
  const distribution: Record<string, number> = {}
  tasks.forEach((task) => {
    const statusObj = statuses.find((s) => s.id === task.statusId || s.name === task.status)
    const key = statusObj ? statusObj.name : "Unknown"
    distribution[key] = (distribution[key] || 0) + 1
  })

  return {
    completedTasks,
    inProgressTasks,
    todoTasks,
    blockedTasks,
    completionRate,
    avgTime,
    distribution,
  }
} 