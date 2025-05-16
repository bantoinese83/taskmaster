"use client"

import { useState } from "react"
import { useTemplateCustomization } from "@/lib/hooks/use-template-customization"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ColorPalette } from "@/components/ui/color-palette"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, ArrowDown, ArrowUp, Check, ChevronLeft, Plus, Trash2, X } from "lucide-react"

interface TemplateCustomizerProps {
  templateId: string
  onCancel: () => void
  onApplied: () => void
}

export function TemplateCustomizer({ templateId, onCancel, onApplied }: TemplateCustomizerProps) {
  const {
    customizedTemplate,
    isCustomizing,
    isLoading,
    startCustomizing,
    cancelCustomizing,
    updateTemplateName,
    updateTemplateDescription,
    addStatus,
    updateStatus,
    removeStatus,
    moveStatus,
    applyCustomizedTemplate,
  } = useTemplateCustomization()

  const { toast } = useToast()
  const [expandedStatusIndex, setExpandedStatusIndex] = useState<number | null>(null)

  // Start customizing when the component mounts
  useState(() => {
    startCustomizing(templateId)
  })

  const handleCancel = () => {
    cancelCustomizing()
    onCancel()
  }

  const handleApply = async () => {
    if (!customizedTemplate) return

    const result = await applyCustomizedTemplate()

    if (result) {
      toast({
        title: "Template applied",
        description: "Your customized workflow has been applied successfully.",
      })
      onApplied()
    } else {
      toast({
        title: "Error",
        description: "Failed to apply the customized template. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleStatusExpand = (index: number) => {
    setExpandedStatusIndex(expandedStatusIndex === index ? null : index)
  }

  if (!isCustomizing || !customizedTemplate) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={handleCancel} className="mr-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-xl font-semibold">Customize Template</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={customizedTemplate.customName || customizedTemplate.name}
              onChange={(e) => updateTemplateName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={customizedTemplate.customDescription || customizedTemplate.description}
              onChange={(e) => updateTemplateDescription(e.target.value)}
              placeholder="Enter template description"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Workflow Statuses</CardTitle>
          <Button variant="outline" size="sm" onClick={addStatus}>
            <Plus className="h-4 w-4 mr-1" />
            Add Status
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {customizedTemplate.statuses.map((status, index) => (
                <Card key={index} className={expandedStatusIndex === index ? "border-primary" : ""}>
                  <CardHeader className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center cursor-pointer" onClick={() => toggleStatusExpand(index)}>
                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: status.color }}></div>
                        <span className="font-medium">{status.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStatus(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                          <span className="sr-only">Move up</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveStatus(index, Math.min(customizedTemplate.statuses.length - 1, index + 1))}
                          disabled={index === customizedTemplate.statuses.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                          <span className="sr-only">Move down</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleStatusExpand(index)}>
                          {expandedStatusIndex === index ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          <span className="sr-only">{expandedStatusIndex === index ? "Collapse" : "Expand"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStatus(index)}
                          disabled={customizedTemplate.statuses.length <= 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {expandedStatusIndex === index && (
                    <>
                      <Separator />
                      <CardContent className="p-3 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`status-name-${index}`}>Status Name</Label>
                          <Input
                            id={`status-name-${index}`}
                            value={status.name}
                            onChange={(e) => updateStatus(index, { name: e.target.value })}
                            placeholder="Enter status name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`status-description-${index}`}>Description</Label>
                          <Textarea
                            id={`status-description-${index}`}
                            value={status.description || ""}
                            onChange={(e) => updateStatus(index, { description: e.target.value })}
                            placeholder="Enter status description"
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`status-color-${index}`}>Color</Label>
                          <ColorPalette
                            selectedColor={status.color}
                            onColorSelect={(color) => updateStatus(index, { color })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`status-wip-${index}`}>WIP Limit (optional)</Label>
                          <Input
                            id={`status-wip-${index}`}
                            type="number"
                            min="0"
                            value={status.wipLimit !== null ? status.wipLimit : ""}
                            onChange={(e) => {
                              const value = e.target.value === "" ? null : Number.parseInt(e.target.value, 10)
                              updateStatus(index, { wipLimit: value })
                            }}
                            placeholder="No limit"
                          />
                          <p className="text-xs text-muted-foreground">Leave empty for no limit</p>
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>
              ))}

              {customizedTemplate.statuses.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-md">
                  <p className="text-muted-foreground mb-2">No statuses defined</p>
                  <Button variant="outline" size="sm" onClick={addStatus}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Status
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {customizedTemplate.statuses.length < 2 && (
          <CardFooter className="bg-amber-50 dark:bg-amber-950/20 p-3">
            <div className="flex items-center text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 mr-2" />
              <p className="text-xs">A workflow should have at least two statuses</p>
            </div>
          </CardFooter>
        )}
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleApply} disabled={isLoading || customizedTemplate.statuses.length < 2}>
          {isLoading ? "Applying..." : "Apply Template"}
        </Button>
      </div>
    </div>
  )
}
