'use client'
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import KanbanBoard from "@/components/kanban/kanban-board";
import { useTasks } from "@/lib/hooks/use-tasks";
import KanbanToolbar from "@/components/kanban/kanban-toolbar";

export default function KanbanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { tasks, isLoading, error } = useTasks();

  if (status === "loading") return null;
  if (!session) {
    router.replace("/auth/signin");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground mt-1">Visualize and manage your workflow</p>
      </div>
      <KanbanToolbar />
      <div className="mt-4">
        <KanbanBoard tasks={tasks} />
      </div>
    </div>
  );
}
