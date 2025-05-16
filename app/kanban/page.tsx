import { withAuth } from "@/components/with-auth";
import KanbanBoard from "@/components/kanban/kanban-board"
import { KanbanToolbar } from "@/components/kanban/kanban-toolbar"

function KanbanPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground mt-1">Visualize and manage your workflow</p>
      </div>
      <KanbanToolbar />
      <div className="mt-4">
        <KanbanBoard />
      </div>
    </div>
  )
}

export default withAuth(KanbanPage);
