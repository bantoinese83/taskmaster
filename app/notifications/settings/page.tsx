import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"
import NotificationSettings from "@/components/notifications/notification-settings"

export default async function NotificationSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(ROUTES.SIGN_IN)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notification Settings</h1>
      <NotificationSettings />
    </div>
  )
}
