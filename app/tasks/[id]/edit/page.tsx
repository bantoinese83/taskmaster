import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getTaskById } from "@/lib/tasks"
import TaskForm from "@/components/tasks/task-form"

export default async function EditTaskPage({
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
      <h1 className="text-3xl font-bold mb-6">Edit Task</h1>
      <TaskForm task={task} />
    </div>
  )
}
