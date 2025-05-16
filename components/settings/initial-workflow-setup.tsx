"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useWorkflowTemplates } from "@/lib/hooks/use-workflow-templates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WorkflowTemplatePreview } from "@/components/settings/workflow-template-preview"
import { TemplateCustomizer } from "@/components/settings/template-customizer"
import { useToast } from "@/hooks/use-toast"
import { ROUTES } from "@/lib/constants"
import { ArrowRight, Check, Pencil } from "lucide-react"
import type { WorkflowTemplate } from "@/lib/types"

export function InitialWorkflowSetup() {
  const { templates, applyTemplate, isLoading } = useWorkflowTemplates()
  const { toast } = useToast()
  const router = useRouter()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null)
  const [isCustomizing, setIsCustomizing] = useState(false)

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplateId(template.id)
    setPreviewTemplate(template)
  }

  const handleCustomizeTemplate = () => {
    setIsCustomizing(true)
  }

  const handleCustomizationCancel = () => {
    setIsCustomizing(false)
  }

  const handleCustomizationApplied = () => {
    setIsCustomizing(false)
    toast({
      title: "Customized workflow created",
      description: "Your customized workflow has been set up successfully.",
    })
    router.push(ROUTES.KANBAN)
  }

  if (isCustomizing && selectedTemplateId) {
    return (
      <div className="max-w-4xl mx-auto">
        <TemplateCustomizer
          templateId={selectedTemplateId}
          onCancel={handleCustomizationCancel}
          onApplied={handleCustomizationApplied}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Set Up Your Workflow</h1>
        <p className="text-muted-foreground">
          Choose a template that best matches your project type to get started quickly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all ${
              selectedTemplateId === template.id ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"
            }`}
            onClick={() => handleSelectTemplate(template)}
          >
            <CardHeader className="pb-2 relative">
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              )}
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
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
              <Button variant="ghost" size="sm" className="ml-auto">
                Select
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {previewTemplate && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <WorkflowTemplatePreview template={previewTemplate} />
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={handleCustomizeTemplate}
          disabled={!selectedTemplateId || isLoading}
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Customize First
        </Button>
        <Button onClick={() => applyTemplate(selectedTemplateId!)} disabled={!selectedTemplateId || isLoading} className="gap-2">
          {isLoading ? "Setting up..." : "Set Up Workflow"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
