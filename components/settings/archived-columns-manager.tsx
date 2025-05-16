import { useWorkflow } from "@/lib/hooks/use-workflow";
import { Button } from "@/components/ui/button";

export function ArchivedColumnsManager() {
  const { statuses, updateWorkflowSettings } = useWorkflow();
  const archivedColumns = statuses?.filter((status) => status.isArchived) || [];

  const handleUnarchive = async (statusId: string) => {
    // This assumes you have an unarchiveStatus method in your workflow store/hook
    // If not, you should implement it accordingly
    if (typeof window !== "undefined" && window.confirm("Unarchive this column?")) {
      // You may need to call a real unarchiveStatus here
      // For now, just a placeholder for the action
      // await unarchiveStatus(statusId);
      alert(`Unarchive logic for column ${statusId} goes here.`);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Archived Columns</h2>
      {archivedColumns.length === 0 ? (
        <p className="text-muted-foreground text-sm">No archived columns.</p>
      ) : (
        <ul className="space-y-2">
          {archivedColumns.map((col) => (
            <li key={col.id} className="flex items-center justify-between border rounded p-2 bg-muted/30">
              <span>{col.name}</span>
              <Button size="sm" variant="outline" onClick={() => handleUnarchive(col.id)}>
                Unarchive
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 