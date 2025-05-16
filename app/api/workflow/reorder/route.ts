import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Reorder validation schema
const reorderSchema = z.object({
  statusIds: z.array(z.string()),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const validatedData = reorderSchema.parse(json)

    // Get user's workflow settings
    const workflowSettings = await prisma.workflowSettings.findUnique({
      where: { userId: session.user.id },
      include: {
        statuses: true,
      },
    })

    if (!workflowSettings) {
      return NextResponse.json({ error: "Workflow settings not found" }, { status: 404 })
    }

    // Verify all status IDs belong to the user
    const statusIds = validatedData.statusIds
    const userStatusIds = workflowSettings.statuses.map((status) => status.id)

    const allStatusesBelongToUser = statusIds.every((id) => userStatusIds.includes(id))

    if (!allStatusesBelongToUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update order for each status
    for (let i = 0; i < statusIds.length; i++) {
      await prisma.workflowStatus.update({
        where: { id: statusIds[i] },
        data: { order: i },
      })
    }

    // Get updated statuses
    const updatedStatuses = await prisma.workflowStatus.findMany({
      where: {
        workflowSettingsId: workflowSettings.id,
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(updatedStatuses)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error reordering workflow statuses:", error)
    return NextResponse.json({ error: "Failed to reorder workflow statuses" }, { status: 500 })
  }
}
