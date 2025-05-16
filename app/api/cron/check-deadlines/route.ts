import { NextResponse } from "next/server"
import { checkAndNotifyDeadlines } from "@/lib/services/notification-service"

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const url = new URL(request.url)
    const secret = url.searchParams.get("secret")

    // Validate the secret against the environment variable
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifiedCount = await checkAndNotifyDeadlines()

    return NextResponse.json({
      success: true,
      message: `Checked deadlines and sent ${notifiedCount} notifications`,
    })
  } catch (error) {
    console.error("Error in deadline check cron:", error)
    return NextResponse.json({ error: "Failed to check deadlines" }, { status: 500 })
  }
}
