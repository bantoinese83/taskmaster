"use client"

import { useState } from "react"
import { useWorkflowTemplates } from "@/lib/hooks/use-workflow-templates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Check, Info, Pencil } from "lucide-react"
import { TemplateCustomizer } from "@/components/settings/template-customizer"
import type { WorkflowTemplate } from "@/lib/types"

export function WorkflowTemplateSelector() {
  const { templates, applyTemplate, isLoading } = useWorkflowTemplates()
  const { toast } = useToast()
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(false)

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template)
    setConfirmDialogOpen(true)
  }

  const handleCustomizeTemplate = () => {
    setConfirmDialogOpen(false)
    setIsCustomizing(true)
  }

  const handleCustomizationCancel = () => {
    setIsCustomizing(false)
    setSelectedTemplate(null)
  }

  const handleCustomizationApplied = () => {
    setIsCustomizing(false)
    setSelectedTemplate(null)
    toast({
      title: "Customized template applied",
      description: "Your customized workflow has been set up successfully.",
    })
  }

  return (
    <>
      {isCustomizing && selectedTemplate ? (
        <TemplateCustomizer
          templateId={selectedTemplate.id}
          onCancel={handleCustomizationCancel}
          onApplied={handleCustomizationApplied}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-muted-foreground">
              Select a template below to quickly set up a workflow for your project type. This will replace your current
              workflow configuration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2">
                    {template.statuses.map((status) => (
                      <div
                        key={status.name}
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: `${status.color}20`, // 20% opacity
                          color: status.color,
                          border: `1px solid ${status.color}40`, // 40% opacity
                        }}
                      >
                        {status.name}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Use Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Workflow Template</DialogTitle>
            <DialogDescription>
              You can apply this template directly or customize it first to better fit your needs.
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">Included Statuses:</h4>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {selectedTemplate.statuses.map((status) => (
                      <div key={status.name} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                        <div>
                          <p className="text-sm font-medium">{status.name}</p>
                          {status.description && <p className="text-xs text-muted-foreground">{status.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex items-center space-x-2 text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">
                  Tasks will be reassigned to the new statuses based on their names. Some tasks may need to be manually
                  reassigned.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="sm:mr-auto order-3 sm:order-1"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="outline" className="order-2" onClick={handleCustomizeTemplate}>
              <Pencil className="h-4 w-4 mr-2" />
              Customize First
            </Button>
            <Button onClick={() => applyTemplate(selectedTemplate.id)} disabled={!selectedTemplate || isLoading}>
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
