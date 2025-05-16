import { prisma } from "@/lib/prisma"
import { NOTIFICATION_TYPES, NOTIFICATION_TITLES, ROUTES } from "@/lib/constants"
import type { Task, Comment, NotificationType } from "@/lib/types"

export async function createNotification({
  type,
  userId,
  taskId,
  message,
  actionUrl,
}: {
  type: NotificationType
  userId: string
  taskId?: string
  message: string
  actionUrl?: string
}) {
  try {
    // Check if user has notification settings
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId },
    })

    // If settings exist, check if this notification type is enabled
    if (settings) {
      let isEnabled = true

      switch (type) {
        case NOTIFICATION_TYPES.TASK_ASSIGNED:
          isEnabled = settings.taskAssigned
          break
        case NOTIFICATION_TYPES.TASK_UPDATED:
          isEnabled = settings.taskUpdated
          break
        case NOTIFICATION_TYPES.TASK_COMMENTED:
          isEnabled = settings.taskCommented
          break
        case NOTIFICATION_TYPES.DEADLINE_APPROACHING:
          isEnabled = settings.deadlineApproaching
          break
        case NOTIFICATION_TYPES.STATUS_CHANGED:
          isEnabled = settings.statusChanged
          break
      }

      if (!isEnabled) {
        return null
      }
    }

    // Create notification
    return await prisma.notification.create({
      data: {
        type,
        title: NOTIFICATION_TITLES[type],
        message,
        isRead: false,
        user: {
          connect: { id: userId },
        },
        ...(taskId ? { task: { connect: { id: taskId } } } : {}),
        actionUrl: actionUrl || null,
      },
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return null
  }
}

export async function notifyTaskAssigned(task: Task) {
  if (!task.assigneeId) return null

  return await createNotification({
    type: NOTIFICATION_TYPES.TASK_ASSIGNED,
    userId: task.assigneeId,
    taskId: task.id,
    message: `You have been assigned to the task "${task.title}"`,
    actionUrl: ROUTES.TASK_DETAIL(task.id),
  })
}

export async function notifyTaskUpdated(task: Task, updatedBy: string) {
  const notifications = []

  // Notify creator if they're not the one who updated it
  if (task.creatorId !== updatedBy) {
    notifications.push(
      await createNotification({
        type: NOTIFICATION_TYPES.TASK_UPDATED,
        userId: task.creatorId,
        taskId: task.id,
        message: `Task "${task.title}" has been updated`,
        actionUrl: ROUTES.TASK_DETAIL(task.id),
      }),
    )
  }

  // Notify assignee if they're not the one who updated it
  if (task.assigneeId && task.assigneeId !== updatedBy) {
    notifications.push(
      await createNotification({
        type: NOTIFICATION_TYPES.TASK_UPDATED,
        userId: task.assigneeId,
        taskId: task.id,
        message: `Task "${task.title}" has been updated`,
        actionUrl: ROUTES.TASK_DETAIL(task.id),
      }),
    )
  }

  return notifications.filter(Boolean)
}

export async function notifyTaskCommented(task: Task, comment: Comment) {
  const notifications = []

  // Notify creator if they're not the one who commented
  if (task.creatorId !== comment.userId) {
    notifications.push(
      await createNotification({
        type: NOTIFICATION_TYPES.TASK_COMMENTED,
        userId: task.creatorId,
        taskId: task.id,
        message: `New comment on task "${task.title}"`,
        actionUrl: ROUTES.TASK_DETAIL(task.id),
      }),
    )
  }

  // Notify assignee if they're not the one who commented
  if (task.assigneeId && task.assigneeId !== comment.userId) {
    notifications.push(
      await createNotification({
        type: NOTIFICATION_TYPES.TASK_COMMENTED,
        userId: task.assigneeId,
        taskId: task.id,
        message: `New comment on task "${task.title}"`,
        actionUrl: ROUTES.TASK_DETAIL(task.id),
      }),
    )
  }

  return notifications.filter(Boolean)
}

export async function notifyDeadlineApproaching(task: Task) {
  const notifications = []

  // Notify creator
  notifications.push(
    await createNotification({
      type: NOTIFICATION_TYPES.DEADLINE_APPROACHING,
      userId: task.creatorId,
      taskId: task.id,
      message: `Task "${task.title}" is due soon`,
      actionUrl: ROUTES.TASK_DETAIL(task.id),
    }),
  )

  // Notify assignee if exists
  if (task.assigneeId) {
    notifications.push(
      await createNotification({
        type: NOTIFICATION_TYPES.DEADLINE_APPROACHING,
        userId: task.assigneeId,
        taskId: task.id,
        message: `Task "${task.title}" is due soon`,
        actionUrl: ROUTES.TASK_DETAIL(task.id),
      }),
    )
  }

  return notifications.filter(Boolean)
}

export async function notifyStatusChanged(task: Task, oldStatus: string, updatedBy: string) {
  const notifications = []

  // Notify creator if they're not the one who updated it
  if (task.creatorId !== updatedBy) {
    notifications.push(
      await createNotification({
        type: NOTIFICATION_TYPES.STATUS_CHANGED,
        userId: task.creatorId,
        taskId: task.id,
        message: `Task "${task.title}" status changed from ${oldStatus} to ${task.status}`,
        actionUrl: ROUTES.TASK_DETAIL(task.id),
      }),
    )
  }

  // Notify assignee if they're not the one who updated it
  if (task.assigneeId && task.assigneeId !== updatedBy) {
    notifications.push(
      await createNotification({
        type: NOTIFICATION_TYPES.STATUS_CHANGED,
        userId: task.assigneeId,
        taskId: task.id,
        message: `Task "${task.title}" status changed from ${oldStatus} to ${task.status}`,
        actionUrl: ROUTES.TASK_DETAIL(task.id),
      }),
    )
  }

  return notifications.filter(Boolean)
}

export async function notifyPriorityChanged(task: Task, oldPriority: string, updatedBy: string) {
  const notifications = []

  // Notify creator if they're not the one who updated it
  if (task.creatorId !== updatedBy) {
    notifications.push(
      await createNotification({
        type: NOTIFICATION_TYPES.PRIORITY_CHANGED,
        userId: task.creatorId,
        taskId: task.id,
        message: `Task "${task.title}" priority changed from ${oldPriority} to ${task.priority}`,
        actionUrl: ROUTES.TASK_DETAIL(task.id),
      }),
    )
  }

  // Notify assignee if they're not the one who updated it
  if (task.assigneeId && task.assigneeId !== updatedBy) {
    notifications.push(
      await createNotification({
        type: NOTIFICATION_TYPES.PRIORITY_CHANGED,
        userId: task.assigneeId,
        taskId: task.id,
        message: `Task "${task.title}" priority changed from ${oldPriority} to ${task.priority}`,
        actionUrl: ROUTES.TASK_DETAIL(task.id),
      }),
    )
  }

  return notifications.filter(Boolean)
}

export async function checkAndNotifyDeadlines() {
  try {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Find tasks due in the next 24 hours that haven't been completed
    const tasks = await prisma.task.findMany({
      where: {
        dueDate: {
          gte: now,
          lt: tomorrow,
        },
        status: {
          not: "COMPLETED",
        },
      },
    })

    // Send notifications for each task
    for (const task of tasks) {
      await notifyDeadlineApproaching(task)
    }

    return tasks.length
  } catch (error) {
    console.error("Error checking deadlines:", error)
    return 0
  }
}
