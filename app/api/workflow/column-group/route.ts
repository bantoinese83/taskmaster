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
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get the user's workflow settings
    const workflowSettings = await prisma.workflowSettings.findUnique({
      where: { userId: session.user.id },
    })

    if (!workflowSettings) {
      return NextResponse.json({ error: "Workflow settings not found" }, { status: 404 })
    }

    // Get all column groups for the workflow
    const columnGroups = await prisma.columnGroup.findMany({
      where: { workflowSettingsId: workflowSettings.id },
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

    return NextResponse.json(columnGroups)
  } catch (error) {
    console.error("Error fetching column groups:", error)
    return NextResponse.json({ error: "Failed to fetch column groups" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const validatedData = columnGroupSchema.parse(json)

    // Get the user's workflow settings
    const workflowSettings = await prisma.workflowSettings.findUnique({
      where: { userId: session.user.id },
    })

    if (!workflowSettings) {
      return NextResponse.json({ error: "Workflow settings not found" }, { status: 404 })
    }

    // Get the highest order value to place the new group at the end
    const highestOrderGroup = await prisma.columnGroup.findFirst({
      where: { workflowSettingsId: workflowSettings.id },
      orderBy: {
        order: "desc",
      },
    })

    const newOrder = highestOrderGroup ? highestOrderGroup.order + 1 : 0

    // Create the new column group
    const columnGroup = await prisma.columnGroup.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        color: validatedData.color,
        order: newOrder,
        workflowSettingsId: workflowSettings.id,
      },
      include: {
        statuses: true,
      },
    })

    return NextResponse.json(columnGroup)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating column group:", error)
    return NextResponse.json({ error: "Failed to create column group" }, { status: 500 })
  }
}
