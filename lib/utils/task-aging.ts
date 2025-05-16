import type { Task } from "@/lib/types"

export type AgingStatus = "normal" | "warning" | "critical"

/**
 * Returns the number of hours a task has been in its current column.
 * Uses statusHistory if available, otherwise falls back to createdAt.
 */
export function getTaskAgeInColumn(task: Task): number {
  const now = new Date()
  let enteredAt: Date | null = null

  if (task.statusHistory && Array.isArray(task.statusHistory) && task.statusId) {
    // Find the most recent entry for the current status
    const entry = task.statusHistory.find(
      (h) => h.statusId === task.statusId && !h.exitedAt
    )
    if (entry) {
      enteredAt = new Date(entry.enteredAt)
    }
  }

  if (!enteredAt) {
    enteredAt = new Date(task.createdAt)
  }

  const diffMs = now.getTime() - enteredAt.getTime()
  return diffMs / (1000 * 60 * 60) // hours
}

/**
 * Returns the aging status ('normal', 'warning', 'critical') based on thresholds.
 * @param ageInHours Number of hours the task has been in the column
 * @param thresholds { warning: number, critical: number }
 */
export function getAgingStatus(
  ageInHours: number,
  thresholds: { warning: number; critical: number }
): AgingStatus {
  if (ageInHours >= thresholds.critical) return "critical"
  if (ageInHours >= thresholds.warning) return "warning"
  return "normal"
} 