import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getTaskById } from "@/lib/tasks"
import TaskDetail from "@/components/tasks/task-detail"

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const task = await getTaskById(params.id)

  if (!task) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TaskDetail task={{
        ...task,
        status: task.status as import('@/lib/types').TaskStatus,
        priority: task.priority as import('@/lib/types').TaskPriority,
        dueDate: task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate,
        createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
        updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt,
      }} />
    </div>
  )
}
