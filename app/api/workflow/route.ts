import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Workflow settings validation schema
const workflowSettingsSchema = z.object({
  name: z.string().min(1, "Workflow name is required").max(100),
  description: z.string().optional(),
  enforceWipLimits: z.boolean().optional(),
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get the user's workflow settings
    let settings = await prisma.workflowSettings.findUnique({
      where: { userId: session.user.id },
      include: {
        statuses: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    // If no settings exist, create default settings
    if (!settings) {
      settings = await createDefaultWorkflowSettings(session.user.id)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching workflow settings:", error)
    return NextResponse.json({ error: "Failed to fetch workflow settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const validatedData = workflowSettingsSchema.parse(json)

    // Check if settings exist
    let settings = await prisma.workflowSettings.findUnique({
      where: { userId: session.user.id },
    })

    if (!settings) {
      // Create default settings if they don't exist
      settings = await createDefaultWorkflowSettings(session.user.id)
    }

    // Update settings
    settings = await prisma.workflowSettings.update({
      where: { id: settings.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        enforceWipLimits: validatedData.enforceWipLimits,
      },
      include: {
        statuses: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating workflow settings:", error)
    return NextResponse.json({ error: "Failed to update workflow settings" }, { status: 500 })
  }
}

// Helper function to create default workflow settings
async function createDefaultWorkflowSettings(userId: string) {
  const settings = await prisma.workflowSettings.create({
    data: {
      name: "My Workflow",
      description: "Default workflow",
      isDefault: true,
      enforceWipLimits: false,
      userId,
      statuses: {
        create: [
          {
            name: "To Do",
            color: "#3b82f6", // Blue
            order: 0,
            isDefault: true,
          },
          {
            name: "In Progress",
            color: "#f59e0b", // Amber
            order: 1,
            isDefault: false,
          },
          {
            name: "Done",
            color: "#10b981", // Emerald
            order: 2,
            isDefault: false,
          },
        ],
      },
    },
    include: {
      statuses: {
        orderBy: {
          order: "asc",
        },
      },
    },
  })

  return settings
}
