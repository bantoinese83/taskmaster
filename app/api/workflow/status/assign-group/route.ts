import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Assignment validation schema
const assignmentSchema = z.object({
  statusId: z.string(),
  columnGroupId: z.string().nullable(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const validatedData = assignmentSchema.parse(json)

    // Get the status
    const status = await prisma.workflowStatus.findUnique({
      where: { id: validatedData.statusId },
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

    // If assigning to a group, verify the group exists and belongs to the user
    if (validatedData.columnGroupId) {
      const columnGroup = await prisma.columnGroup.findUnique({
        where: { id: validatedData.columnGroupId },
        include: {
          workflowSettings: true,
        },
      })

      if (!columnGroup) {
        return NextResponse.json({ error: "Column group not found" }, { status: 404 })
      }

      if (columnGroup.workflowSettings.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Update the status with the column group
    const updatedStatus = await prisma.workflowStatus.update({
      where: { id: validatedData.statusId },
      data: {
        columnGroupId: validatedData.columnGroupId,
      },
      include: {
        columnGroup: true,
      },
    })

    return NextResponse.json(updatedStatus)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error assigning status to column group:", error)
    return NextResponse.json({ error: "Failed to assign status to column group" }, { status: 500 })
  }
}
