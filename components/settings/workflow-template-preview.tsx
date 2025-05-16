import { Card, CardContent } from "@/components/ui/card"
import type { WorkflowTemplate } from "@/lib/types"

interface WorkflowTemplatePreviewProps {
  template: WorkflowTemplate
}

export function WorkflowTemplatePreview({ template }: WorkflowTemplatePreviewProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex overflow-x-auto p-4 gap-4 min-h-[200px]">
          {template.statuses.map((status) => (
            <div key={status.name} className="flex-shrink-0 w-[200px]">
              <div className="h-8 rounded-t-md flex items-center px-3" style={{ backgroundColor: status.color }}>
                <span className="text-white text-sm font-medium truncate">{status.name}</span>
              </div>
              <div className="border border-t-0 rounded-b-md p-3 h-[calc(100%-2rem)] bg-card">
                <div className="text-xs text-muted-foreground mb-2">
                  {status.wipLimit ? `WIP Limit: ${status.wipLimit}` : "No WIP Limit"}
                </div>
                {status.description && (
                  <p className="text-xs text-muted-foreground line-clamp-3">{status.description}</p>
                )}
                <div className="mt-4 space-y-2">
                  {/* Sample task cards */}
                  <div className="border rounded-md p-2 bg-background shadow-sm">
                    <div className="w-full h-2 bg-muted rounded-full mb-2"></div>
                    <div className="w-3/4 h-2 bg-muted rounded-full"></div>
                  </div>
                  <div className="border rounded-md p-2 bg-background shadow-sm">
                    <div className="w-full h-2 bg-muted rounded-full mb-2"></div>
                    <div className="w-2/4 h-2 bg-muted rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
