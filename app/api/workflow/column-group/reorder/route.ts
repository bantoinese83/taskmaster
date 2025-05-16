import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Reorder validation schema
const reorderSchema = z.object({
  columnGroupIds: z.array(z.string()),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const validatedData = reorderSchema.parse(json)

    // Get the user's workflow settings
    const workflowSettings = await prisma.workflowSettings.findUnique({
      where: { userId: session.user.id },
    })

    if (!workflowSettings) {
      return NextResponse.json({ error: "Workflow settings not found" }, { status: 404 })
    }

    // Verify all column groups belong to the user
    const columnGroups = await prisma.columnGroup.findMany({
      where: {
        id: { in: validatedData.columnGroupIds },
        workflowSettingsId: workflowSettings.id,
      },
    })

    if (columnGroups.length !== validatedData.columnGroupIds.length) {
      return NextResponse.json({ error: "One or more column groups not found" }, { status: 404 })
    }

    // Update the order of each column group
    for (let i = 0; i < validatedData.columnGroupIds.length; i++) {
      await prisma.columnGroup.update({
        where: { id: validatedData.columnGroupIds[i] },
        data: { order: i },
      })
    }

    // Get the updated column groups
    const updatedColumnGroups = await prisma.columnGroup.findMany({
      where: {
        workflowSettingsId: workflowSettings.id,
      },
      include: {
        statuses: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(updatedColumnGroups)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error reordering column groups:", error)
    return NextResponse.json({ error: "Failed to reorder column groups" }, { status: 500 })
  }
}
