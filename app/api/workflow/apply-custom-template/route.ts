import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const customTemplateStatusSchema = z.object({
  name: z.string().min(1, "Status name is required"),
  description: z.string().nullable(),
  color: z.string().min(1, "Color is required"),
  order: z.number(),
  wipLimit: z.number().nullable(),
})

const customTemplateSchema = z.object({
  template: z.object({
    id: z.string(),
    name: z.string().min(1, "Template name is required"),
    description: z.string(),
    statuses: z.array(customTemplateStatusSchema),
    customName: z.string().optional(),
    customDescription: z.string().optional(),
    isCustomized: z.boolean().optional(),
  }),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const { template } = customTemplateSchema.parse(json)

    // Use customized values if available
    const templateName = template.customName || template.name
    const templateDescription = template.customDescription || template.description

    // Check if user already has workflow settings
    const existingSettings = await prisma.workflowSettings.findUnique({
      where: { userId: session.user.id },
      include: { statuses: true },
    })

    // If settings exist, delete all existing statuses
    if (existingSettings) {
      // Delete all existing statuses
      await prisma.workflowStatus.deleteMany({
        where: { workflowSettingsId: existingSettings.id },
      })

      // Update workflow settings
      await prisma.workflowSettings.update({
        where: { id: existingSettings.id },
        data: {
          name: templateName,
          description: templateDescription,
        },
      })

      // Create new statuses from template
      for (const status of template.statuses) {
        await prisma.workflowStatus.create({
          data: {
            name: status.name,
            description: status.description,
            color: status.color,
            order: status.order,
            wipLimit: status.wipLimit,
            workflowSettingsId: existingSettings.id,
          },
        })
      }

      // Fetch updated workflow settings
      const updatedSettings = await prisma.workflowSettings.findUnique({
        where: { id: existingSettings.id },
        include: {
          statuses: {
            orderBy: {
              order: "asc",
            },
          },
        },
      })

      return NextResponse.json(updatedSettings)
    } else {
      // Create new workflow settings with template
      const newSettings = await prisma.workflowSettings.create({
        data: {
          name: templateName,
          description: templateDescription,
          userId: session.user.id,
          statuses: {
            create: template.statuses.map((status) => ({
              name: status.name,
              description: status.description,
              color: status.color,
              order: status.order,
              wipLimit: status.wipLimit,
            })),
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

      return NextResponse.json(newSettings)
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error applying custom template:", error)
    return NextResponse.json({ error: "Failed to apply custom template" }, { status: 500 })
  }
}
