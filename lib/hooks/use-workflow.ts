"use client"

import { useEffect } from "react"
import { useWorkflowStore } from "@/lib/store/workflow-store"
import type { WorkflowStatus } from "@/lib/types"

export function useWorkflow() {
  const {
    settings,
    statuses,
    isLoading,
    error,
    fetchWorkflowSettings,
    updateWorkflowSettings,
    createStatus,
    updateStatus,
    deleteStatus,
    reorderStatuses,
  } = useWorkflowStore()

  useEffect(() => {
    fetchWorkflowSettings()
  }, [fetchWorkflowSettings])

  const getStatusById = (id: string | null | undefined): WorkflowStatus | undefined => {
    if (!id) return undefined
    return statuses.find((status) => status.id === id)
  }

  const getStatusByName = (name: string): WorkflowStatus | undefined => {
    return statuses.find((status) => status.name === name)
  }

  const getDefaultStatus = (): WorkflowStatus | undefined => {
    return statuses.find((status) => status.isDefault)
  }

  return {
    settings,
    statuses,
    isLoading,
    error,
    fetchWorkflowSettings,
    updateWorkflowSettings,
    createStatus,
    updateStatus,
    deleteStatus,
    reorderStatuses,
    getStatusById,
    getStatusByName,
    getDefaultStatus,
  }
}
