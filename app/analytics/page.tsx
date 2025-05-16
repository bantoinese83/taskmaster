import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard"

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(ROUTES.SIGN_IN)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <AnalyticsDashboard />
    </div>
  )
}
