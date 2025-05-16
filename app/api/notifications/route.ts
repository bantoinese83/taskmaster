import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !('id' in session.user) || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Parse query parameters
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const unreadOnly = url.searchParams.get("unreadOnly") === "true"

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build query
    const where = {
      userId: session.user.id as string,
      ...(unreadOnly ? { isRead: false } : {}),
    }

    // Get notifications with pagination
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const totalCount = await prisma.notification.count({ where })

    return NextResponse.json({
      notifications,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()

    // Validate required fields
    if (!json.userId || !json.type || !json.title || !json.message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: json.userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if task exists if taskId is provided
    if (json.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: json.taskId },
      })

      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 })
      }
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        type: json.type,
        title: json.title,
        message: json.message,
        isRead: false,
        user: {
          connect: { id: json.userId },
        },
        ...(json.taskId ? { task: { connect: { id: json.taskId } } } : {}),
        actionUrl: json.actionUrl || null,
      },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
