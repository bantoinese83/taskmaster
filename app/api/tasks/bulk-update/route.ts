import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for bulk update
const bulkUpdateSchema = z.object({
  taskIds: z.array(z.string()),
  updates: z.object({
    status: z.string().optional(),
    statusId: z.string().optional(),
    priority: z.string().optional(),
    assigneeId: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
  }),
})

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const { taskIds, updates } = bulkUpdateSchema.parse(json)

    // Verify user has access to these tasks
    const tasksCount = await prisma.task.count({
      where: {
        id: { in: taskIds },
        OR: [
          { creatorId: session.user.id },
          { assigneeId: session.user.id },
          // Add any other access conditions here
        ],
      },
    })

    if (tasksCount !== taskIds.length) {
      return NextResponse.json({ error: "Unauthorized access to one or more tasks" }, { status: 403 })
    }

    // Perform bulk update
    const updatedTasks = []

    for (const taskId of taskIds) {
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: updates,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          status_rel: true,
        },
      })

      updatedTasks.push(updatedTask)
    }

    return NextResponse.json(updatedTasks)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating tasks:", error)
    return NextResponse.json({ error: "Failed to update tasks" }, { status: 500 })
  }
}
