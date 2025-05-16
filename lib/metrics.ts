import type { Task, WorkflowStatus } from "@/lib/types"

export interface TimeMetric {
  average: string
  min: string
  max: string
  median: string
}

export interface ColumnMetrics {
  timeInColumn: TimeMetric
  taskCount: number
  completionRate: number
  blockedTasks: number
  overdueCount: number
  assigneeDistribution: Record<string, number>
  priorityDistribution: Record<string, number>
}

export function calculateMetrics(tasks: Task[], status?: WorkflowStatus): ColumnMetrics {
  const now = new Date()

  // Use statusHistory to get when the task entered this column
  const timeInColumnDays = tasks
    .map((task) => {
      let enteredAt: string | undefined = undefined
      if (task.statusHistory && status) {
        // Find the most recent entry for this status
        const entry = task.statusHistory.find(
          (h) => h.statusId === status.id && !h.exitedAt
        )
        if (entry) enteredAt = entry.enteredAt
      }
      const start = enteredAt ? new Date(enteredAt) : new Date(task.createdAt)
      const diffTime = Math.abs(now.getTime() - start.getTime())
      return diffTime / (1000 * 60 * 60 * 24) // days
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

  // Blocked tasks: no property, so always 0
  const blockedTasks = 0

  // Completion rate: 100% if this is a 'done' column, otherwise 0%
  let completionRate = 0
  if (status && /done|complete/i.test(status.name)) {
    completionRate = 100
  }

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