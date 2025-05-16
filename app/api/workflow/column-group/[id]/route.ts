import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Column group validation schema
const columnGroupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(50),
  description: z.string().optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format")
    .optional()
    .nullable(),
  isCollapsed: z.boolean().optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get the column group
    const columnGroup = await prisma.columnGroup.findUnique({
      where: { id: params.id },
      include: {
        workflowSettings: true,
        statuses: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    if (!columnGroup) {
      return NextResponse.json({ error: "Column group not found" }, { status: 404 })
    }

    // Check if the column group belongs to the user
    if (columnGroup.workflowSettings.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(columnGroup)
  } catch (error) {
    console.error("Error fetching column group:", error)
    return NextResponse.json({ error: "Failed to fetch column group" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the column group exists and belongs to the user
    const existingColumnGroup = await prisma.columnGroup.findUnique({
      where: { id: params.id },
      include: {
        workflowSettings: true,
      },
    })

    if (!existingColumnGroup) {
      return NextResponse.json({ error: "Column group not found" }, { status: 404 })
    }

    if (existingColumnGroup.workflowSettings.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const json = await request.json()
    const validatedData = columnGroupSchema.parse(json)

    // Update column group
    const columnGroup = await prisma.columnGroup.update({
      where: { id: params.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        color: validatedData.color,
        isCollapsed: validatedData.isCollapsed,
      },
      include: {
        statuses: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return NextResponse.json(columnGroup)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating column group:", error)
    return NextResponse.json({ error: "Failed to update column group" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if the column group exists and belongs to the user
    const existingColumnGroup = await prisma.columnGroup.findUnique({
      where: { id: params.id },
      include: {
        workflowSettings: true,
        statuses: true,
      },
    })

    if (!existingColumnGroup) {
      return NextResponse.json({ error: "Column group not found" }, { status: 404 })
    }

    if (existingColumnGroup.workflowSettings.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Remove the column group association from all statuses
    await prisma.workflowStatus.updateMany({
      where: { columnGroupId: params.id },
      data: { columnGroupId: null },
    })

    // Delete the column group
    await prisma.columnGroup.delete({
      where: { id: params.id },
    })

    // Reorder remaining column groups
    await reorderColumnGroups(existingColumnGroup.workflowSettingsId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting column group:", error)
    return NextResponse.json({ error: "Failed to delete column group" }, { status: 500 })
  }
}

// Helper function to reorder column groups after deletion
async function reorderColumnGroups(workflowSettingsId: string) {
  const columnGroups = await prisma.columnGroup.findMany({
    where: {
      workflowSettingsId,
    },
    orderBy: {
      order: "asc",
    },
  })

  // Update order for each column group
  for (let i = 0; i < columnGroups.length; i++) {
    await prisma.columnGroup.update({
      where: { id: columnGroups[i].id },
      data: { order: i },
    })
  }
}
