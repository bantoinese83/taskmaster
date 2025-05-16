import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"
import NotificationList from "@/components/notifications/notification-list"

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(ROUTES.SIGN_IN)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <NotificationList />
    </div>
  )
}
