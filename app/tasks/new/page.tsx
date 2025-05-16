import { withAuth } from "@/components/with-auth";
import TaskForm from "@/components/tasks/task-form";

function NewTaskPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create New Task</h1>
      <TaskForm />
    </div>
  );
}

export default withAuth(NewTaskPage);
