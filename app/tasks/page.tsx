import { Suspense } from "react"
import { TaskListSkeleton } from "@/components/tasks/task-list-skeleton"
import TaskListContainer from "@/components/tasks/task-list-container"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { ROUTES } from "@/lib/constants"

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(ROUTES.SIGN_IN)
  }

  // Extract filter parameters from URL
  const status = searchParams.status as string | undefined
  const priority = searchParams.priority as string | undefined
  const assigneeId = searchParams.assigneeId as string | undefined
  const search = searchParams.search as string | undefined
  const sortBy = searchParams.sortBy as string | undefined
  const sortDirection = searchParams.sortDirection as string | undefined

  // Initial filter state based on URL parameters
  const initialFilter = {
    status: status || "ALL",
    priority: priority || "ALL",
    assigneeId: assigneeId || "ALL",
    searchQuery: search || "",
    sortBy: sortBy || "dueDate",
    sortDirection: sortDirection || "asc",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tasks</h1>

      <Suspense fallback={<TaskListSkeleton />}>
        <TaskListContainer initialFilter={initialFilter} />
      </Suspense>
    </div>
  )
}
