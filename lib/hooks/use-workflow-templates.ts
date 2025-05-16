"use client"

import { useState } from "react"
import { WORKFLOW_TEMPLATES } from "@/lib/constants/workflow-templates"
import { useWorkflowStore } from "@/lib/store/workflow-store"
import type { WorkflowTemplate, CustomizableTemplate } from "@/lib/types"

export function useWorkflowTemplates() {
  const { applyTemplate, isLoading, error } = useWorkflowStore()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const templates = Object.values(WORKFLOW_TEMPLATES)

  const getTemplateById = (id: string): WorkflowTemplate | undefined => {
    return templates.find((template) => template.id === id)
  }

  return {
    templates,
    selectedTemplate,
    setSelectedTemplate,
    getTemplateById,
    applyTemplate,
    isLoading,
    error,
  }
}
