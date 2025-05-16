import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ROUTES } from "@/lib/constants"
import { InitialWorkflowSetup } from "@/components/settings/initial-workflow-setup"

export default async function SetupWorkflowPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(ROUTES.SIGN_IN)
  }

  // Check if user already has workflow settings
  const existingSettings = await prisma.workflowSettings.findUnique({
    where: { userId: session.user.id },
  })

  // If settings exist, redirect to the kanban board
  if (existingSettings) {
    redirect(ROUTES.KANBAN)
  }

  return <InitialWorkflowSetup />
}
