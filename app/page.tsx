import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import TaskDashboard from "@/components/task-dashboard"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <TaskDashboard />
    </main>
  )
}
