import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Notification settings validation schema
const settingsSchema = z.object({
  taskAssigned: z.boolean().optional(),
  taskUpdated: z.boolean().optional(),
  taskCommented: z.boolean().optional(),
  deadlineApproaching: z.boolean().optional(),
  statusChanged: z.boolean().optional(),
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get user's notification settings
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.user.id },
    })

    // If settings don't exist, create default settings
    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: {
          userId: session.user.id,
          taskAssigned: true,
          taskUpdated: true,
          taskCommented: true,
          deadlineApproaching: true,
          statusChanged: true,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching notification settings:", error)
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const validatedData = settingsSchema.parse(json)

    // Update or create notification settings
    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: {
        ...validatedData,
        userId: session.user.id,
        // Set defaults for any missing fields
        taskAssigned: validatedData.taskAssigned ?? true,
        taskUpdated: validatedData.taskUpdated ?? true,
        taskCommented: validatedData.taskCommented ?? true,
        deadlineApproaching: validatedData.deadlineApproaching ?? true,
        statusChanged: validatedData.statusChanged ?? true,
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating notification settings:", error)
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 })
  }
}
