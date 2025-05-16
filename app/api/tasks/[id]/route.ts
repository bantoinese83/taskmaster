import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  notifyTaskUpdated,
  notifyStatusChanged,
  notifyPriorityChanged,
  notifyTaskAssigned,
} from "@/lib/services/notification-service"
import { z } from "zod"

// Task validation schema
const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assigneeId: z.string().optional(),
  statusId: z.string().optional(),
})

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if task exists and user has access
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        statusHistory: true,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (existingTask.creatorId !== session.user.id && existingTask.assigneeId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const json = await request.json()
    const validatedData = taskSchema.parse(json)

    // Check for status change to update history
    const statusChanged =
      (validatedData.statusId && existingTask.statusId !== validatedData.statusId) ||
      (validatedData.status && existingTask.status !== validatedData.status)

    // Get status name for history
    let statusName = validatedData.status
    if (validatedData.statusId) {
      const status = await prisma.workflowStatus.findUnique({
        where: { id: validatedData.statusId },
      })
      if (status) {
        statusName = status.name
      }
    }

    // Update status history if status changed
    if (statusChanged) {
      // Close the current status entry
      if (existingTask.statusHistory && existingTask.statusHistory.length > 0) {
        const currentStatusEntry = existingTask.statusHistory.find((entry) => !entry.exitedAt)
        if (currentStatusEntry) {
          await prisma.statusHistory.update({
            where: { id: currentStatusEntry.id },
            data: { exitedAt: new Date() },
          })
        }
      }

      // Create a new status entry
      await prisma.statusHistory.create({
        data: {
          taskId: params.id,
          statusId: validatedData.statusId || existingTask.statusId || "default",
          statusName: statusName,
          enteredAt: new Date(),
        },
      })
    }

    // Check for changes that require notifications
    const priorityChanged = existingTask.priority !== validatedData.priority
    const assigneeChanged = existingTask.assigneeId !== validatedData.assigneeId

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        description: validatedData.description || "",
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: validatedData.status,
        priority: validatedData.priority,
        assigneeId: validatedData.assigneeId || null,
        statusId: validatedData.statusId || null,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        statusHistory: {
          orderBy: {
            enteredAt: "desc",
          },
        },
      },
    })

    // Send notifications based on changes
    if (statusChanged) {
      await notifyStatusChanged(updatedTask, existingTask.status, session.user.id)
    }

    if (priorityChanged) {
      await notifyPriorityChanged(updatedTask, existingTask.priority, session.user.id)
    }

    if (assigneeChanged && validatedData.assigneeId) {
      await notifyTaskAssigned(updatedTask)
    }

    // General update notification
    await notifyTaskUpdated(updatedTask, session.user.id)

    return NextResponse.json(updatedTask)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}
