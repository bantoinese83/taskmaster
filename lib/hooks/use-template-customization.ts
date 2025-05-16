"use client"

import { useState, useCallback } from "react"
import { useWorkflowTemplates } from "./use-workflow-templates"
import type { CustomizableTemplate, WorkflowTemplateStatus } from "@/lib/types"

export function useTemplateCustomization() {
  const { templates, applyTemplate, isLoading } = useWorkflowTemplates()
  const [customizedTemplate, setCustomizedTemplate] = useState<CustomizableTemplate | null>(null)
  const [isCustomizing, setIsCustomizing] = useState(false)

  const startCustomizing = useCallback(
    (templateId: string) => {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        setCustomizedTemplate({
          ...template,
          customName: template.name,
          customDescription: template.description,
          statuses: [...template.statuses.map((status) => ({ ...status }))],
          isCustomized: true,
        })
        setIsCustomizing(true)
      }
    },
    [templates],
  )

  const cancelCustomizing = useCallback(() => {
    setCustomizedTemplate(null)
    setIsCustomizing(false)
  }, [])

  const updateTemplateName = useCallback(
    (name: string) => {
      if (customizedTemplate) {
        setCustomizedTemplate({
          ...customizedTemplate,
          customName: name,
        })
      }
    },
    [customizedTemplate],
  )

  const updateTemplateDescription = useCallback(
    (description: string) => {
      if (customizedTemplate) {
        setCustomizedTemplate({
          ...customizedTemplate,
          customDescription: description,
        })
      }
    },
    [customizedTemplate],
  )

  const addStatus = useCallback(() => {
    if (customizedTemplate) {
      const newOrder =
        customizedTemplate.statuses.length > 0 ? Math.max(...customizedTemplate.statuses.map((s) => s.order)) + 1 : 0

      const newStatus: WorkflowTemplateStatus = {
        name: "New Status",
        description: "Description for the new status",
        color: "#6b7280", // Default gray color
        order: newOrder,
        wipLimit: null,
      }

      setCustomizedTemplate({
        ...customizedTemplate,
        statuses: [...customizedTemplate.statuses, newStatus],
      })
    }
  }, [customizedTemplate])

  const updateStatus = useCallback(
    (index: number, updates: Partial<WorkflowTemplateStatus>) => {
      if (customizedTemplate) {
        const updatedStatuses = [...customizedTemplate.statuses]
        updatedStatuses[index] = { ...updatedStatuses[index], ...updates }

        setCustomizedTemplate({
          ...customizedTemplate,
          statuses: updatedStatuses,
        })
      }
    },
    [customizedTemplate],
  )

  const removeStatus = useCallback(
    (index: number) => {
      if (customizedTemplate) {
        const updatedStatuses = customizedTemplate.statuses.filter((_, i) => i !== index)

        // Reorder the remaining statuses
        const reorderedStatuses = updatedStatuses.map((status, i) => ({
          ...status,
          order: i,
        }))

        setCustomizedTemplate({
          ...customizedTemplate,
          statuses: reorderedStatuses,
        })
      }
    },
    [customizedTemplate],
  )

  const moveStatus = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (customizedTemplate && fromIndex !== toIndex) {
        const updatedStatuses = [...customizedTemplate.statuses]
        const [movedStatus] = updatedStatuses.splice(fromIndex, 1)
        updatedStatuses.splice(toIndex, 0, movedStatus)

        // Update order values
        const reorderedStatuses = updatedStatuses.map((status, i) => ({
          ...status,
          order: i,
        }))

        setCustomizedTemplate({
          ...customizedTemplate,
          statuses: reorderedStatuses,
        })
      }
    },
    [customizedTemplate],
  )

  const applyCustomizedTemplate = useCallback(async () => {
    if (!customizedTemplate) return

    try {
      // Create a modified template with the customized values
      const templateToApply = {
        ...customizedTemplate,
        name: customizedTemplate.customName || customizedTemplate.name,
        description: customizedTemplate.customDescription || customizedTemplate.description,
      }

      // Call the API to apply the customized template
      await applyTemplate(templateToApply)

      // Reset the customization state
      setCustomizedTemplate(null)
      setIsCustomizing(false)

      return true
    } catch (error) {
      console.error("Error applying customized template:", error)
      return false
    }
  }, [customizedTemplate, applyTemplate])

  return {
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
  }
}
