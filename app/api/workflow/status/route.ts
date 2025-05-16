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
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user's workflow settings
    const workflowSettings = await prisma.workflowSettings.findUnique({
      where: { userId: session.user.id },
      include: {
        statuses: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    if (!workflowSettings) {
      return NextResponse.json({ error: "Workflow settings not found" }, { status: 404 })
    }

    const json = await request.json()
    const validatedData = statusSchema.parse(json)

    // Calculate the next order value
    const nextOrder =
      workflowSettings.statuses.length > 0 ? Math.max(...workflowSettings.statuses.map((s) => s.order)) + 1 : 0

    // Create new status
    const status = await prisma.workflowStatus.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        color: validatedData.color,
        order: nextOrder,
        workflowSettings: {
          connect: { id: workflowSettings.id },
        },
      },
    })

    return NextResponse.json(status)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating workflow status:", error)
    return NextResponse.json({ error: "Failed to create workflow status" }, { status: 500 })
  }
}
