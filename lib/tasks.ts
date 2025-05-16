import { prisma } from "@/lib/prisma"

export async function getTaskById(id: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return task
  } catch (error) {
    console.error("Error fetching task:", error)
    return null
  }
}
