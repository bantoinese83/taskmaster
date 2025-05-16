import { useWorkflow } from "@/lib/hooks/use-workflow";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SwimlaneProperty } from "@/lib/types";

export function SwimlaneConfig() {
  const { settings, updateWorkflowSettings } = useWorkflow();
  const swimlaneProperty = settings?.swimlaneProperty || "none";

  const handleChange = (value: SwimlaneProperty) => {
    updateWorkflowSettings(
      settings?.name || "My Workflow",
      settings?.description || "",
      settings?.enforceWipLimits || false,
      value // Pass the new swimlane property
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Swimlane Configuration</h2>
      <p className="text-muted-foreground text-sm mb-2">
        Choose how you want to group your Kanban board by swimlanes.
      </p>
      <Select value={swimlaneProperty} onValueChange={handleChange}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Select swimlane property" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Swimlanes</SelectItem>
          <SelectItem value="assignee">By Assignee</SelectItem>
          <SelectItem value="priority">By Priority</SelectItem>
          <SelectItem value="dueDate">By Due Date</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 