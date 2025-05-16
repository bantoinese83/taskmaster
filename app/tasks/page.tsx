'use client'
import { Suspense } from "react"
import { TaskListSkeleton } from "@/components/tasks/task-list-skeleton"
import TaskListContainer from "@/components/tasks/task-list-container"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function TasksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Extract filter parameters from URL
  const statusParam = searchParams.status as string | undefined
  const priority = searchParams.priority as string | undefined
  const assigneeId = searchParams.assigneeId as string | undefined
  const search = searchParams.search as string | undefined
  const sortBy = searchParams.sortBy as string | undefined
  const sortDirection = searchParams.sortDirection as string | undefined

  // Initial filter state based on URL parameters
  const initialFilter = {
    status: statusParam as import('@/lib/types').TaskStatus | 'ALL' || 'ALL',
    priority: priority as import('@/lib/types').TaskPriority | 'ALL' || 'ALL',
    assigneeId: assigneeId || 'ALL',
    searchQuery: search || '',
    sortBy: sortBy as 'priority' | 'dueDate' | 'title' | 'createdAt' || 'dueDate',
    sortDirection: sortDirection as 'asc' | 'desc' || 'asc',
  }

  if (status === "loading") return null;
  if (!session) {
    router.replace("/auth/signin");
    return null;
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

export default TasksPage;
