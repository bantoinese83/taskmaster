import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Status validation schema
const statusSchema = z.object({
  name: z.string().min(1, "Status name is required").max(50),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
  order: z.number().int().optional(),
  wipLimit: z.number().int().min(0).nullable().optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get the status
    const status = await prisma.workflowStatus.findUnique({
      where: { id: params.id },
      include: {
        workflowSettings: true,
      },
    })

    if (!status) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 })
    }

    // Check if the status belongs to the user
    if (status.workflowSettings.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error fetching workflow status:", error)
    return NextResponse.json({ error: "Failed to fetch workflow status" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the status exists and belongs to the user
    const existingStatus = await prisma.workflowStatus.findUnique({
      where: { id: params.id },
      include: {
        workflowSettings: true,
      },
    })

    if (!existingStatus) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 })
    }

    if (existingStatus.workflowSettings.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const json = await request.json()
    const validatedData = statusSchema.parse(json)

    // Update status
    const status = await prisma.workflowStatus.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        color: validatedData.color,
        ...(validatedData.order !== undefined && { order: validatedData.order }),
        wipLimit: validatedData.wipLimit,
      },
    })

    return NextResponse.json(status)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating workflow status:", error)
    return NextResponse.json({ error: "Failed to update workflow status" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the status exists and belongs to the user
    const existingStatus = await prisma.workflowStatus.findUnique({
      where: { id: params.id },
      include: {
        workflowSettings: true,
      },
    })

    if (!existingStatus) {
      return NextResponse.json({ error: "Status not found" }, { status: 404 })
    }

    if (existingStatus.workflowSettings.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if this is a default status
    if (existingStatus.isDefault) {
      return NextResponse.json({ error: "Cannot delete default status" }, { status: 400 })
    }

    // Get all statuses to find a fallback status
    const allStatuses = await prisma.workflowStatus.findMany({
      where: {
        workflowSettingsId: existingStatus.workflowSettingsId,
        id: {
          not: params.id,
        },
      },
      orderBy: {
        order: "asc",
      },
    })

    if (allStatuses.length === 0) {
      return NextResponse.json({ error: "Cannot delete the last status" }, { status: 400 })
    }

    // Find the first status as fallback
    const fallbackStatus = allStatuses[0]

    // Move all tasks from this status to the fallback status
    await prisma.task.updateMany({
      where: {
        statusId: params.id,
      },
      data: {
        statusId: fallbackStatus.id,
      },
    })

    // Delete the status
    await prisma.workflowStatus.delete({
      where: { id: params.id },
    })

    // Reorder remaining statuses
    await reorderStatuses(existingStatus.workflowSettingsId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting workflow status:", error)
    return NextResponse.json({ error: "Failed to delete workflow status" }, { status: 500 })
  }
}

// Helper function to reorder statuses after deletion
async function reorderStatuses(workflowSettingsId: string) {
  const statuses = await prisma.workflowStatus.findMany({
    where: {
      workflowSettingsId,
    },
    orderBy: {
      order: "asc",
    },
  })

  // Update order for each status
  for (let i = 0; i < statuses.length; i++) {
    await prisma.workflowStatus.update({
      where: { id: statuses[i].id },
      data: { order: i },
    })
  }
}
