"use client"

import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { WorkflowSettings, WorkflowStatus, ColumnGroup, CustomizableTemplate } from "@/lib/types"
import { postJSON } from "@/lib/api"

interface WorkflowState {
  settings: WorkflowSettings | null
  isLoading: boolean
  error: string | null

  // Fetch workflow settings
  fetchSettings: () => Promise<WorkflowSettings | null>

  // Status operations
  createStatus: (status: Partial<WorkflowStatus>) => Promise<WorkflowStatus | null>
  updateStatus: (id: string, status: Partial<WorkflowStatus>) => Promise<WorkflowStatus | null>
  deleteStatus: (id: string) => Promise<boolean>
  reorderStatuses: (statusIds: string[]) => Promise<boolean>
  archiveStatus: (id: string) => Promise<boolean>
  restoreStatus: (id: string) => Promise<boolean>

  // Column group operations
  createColumnGroup: (group: Partial<ColumnGroup>) => Promise<ColumnGroup | null>
  updateColumnGroup: (id: string, group: Partial<ColumnGroup>) => Promise<ColumnGroup | null>
  deleteColumnGroup: (id: string) => Promise<boolean>
  reorderColumnGroups: (groupIds: string[]) => Promise<boolean>
  toggleColumnGroupCollapse: (id: string) => Promise<boolean>

  // Status-group assignment
  assignStatusToGroup: (statusId: string, groupId: string | null) => Promise<boolean>

  // Template operations
  applyTemplate: (templateIdOrTemplate: string | CustomizableTemplate) => Promise<boolean>

  // Settings operations
  updateSettings: (settings: Partial<WorkflowSettings>) => Promise<WorkflowSettings | null>
}

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    (set, get) => ({
      settings: null,
      isLoading: false,
      error: null,

      fetchSettings: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/workflow")
          if (!response.ok) {
            throw new Error("Failed to fetch workflow settings")
          }
          const data = await response.json()
          set({ settings: data, isLoading: false })
          return data
        } catch (error) {
          console.error("Error fetching workflow settings:", error)
          set({ error: "Failed to fetch workflow settings", isLoading: false })
          return null
        }
      },

      createStatus: async (status) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/workflow/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(status),
          })
          if (!response.ok) {
            throw new Error("Failed to create status")
          }
          const newStatus = await response.json()

          // Update the local state
          set((state) => ({
            settings: state.settings
              ? {
                  ...state.settings,
                  statuses: [...state.settings.statuses, newStatus],
                }
              : null,
            isLoading: false,
          }))

          return newStatus
        } catch (error) {
          console.error("Error creating status:", error)
          set({ error: "Failed to create status", isLoading: false })
          return null
        }
      },

      updateStatus: async (id, status) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/workflow/status/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(status),
          })
          if (!response.ok) {
            throw new Error("Failed to update status")
          }
          const updatedStatus = await response.json()

          // Update the local state
          set((state) => ({
            settings: state.settings
              ? {
                  ...state.settings,
                  statuses: state.settings.statuses.map((s) => (s.id === id ? updatedStatus : s)),
                }
              : null,
            isLoading: false,
          }))

          return updatedStatus
        } catch (error) {
          console.error("Error updating status:", error)
          set({ error: "Failed to update status", isLoading: false })
          return null
        }
      },

      deleteStatus: async (id) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/workflow/status/${id}`, {
            method: "DELETE",
          })
          if (!response.ok) {
            throw new Error("Failed to delete status")
          }

          // Update the local state
          set((state) => ({
            settings: state.settings
              ? {
                  ...state.settings,
                  statuses: state.settings.statuses.filter((s) => s.id !== id),
                }
              : null,
            isLoading: false,
          }))

          return true
        } catch (error) {
          console.error("Error deleting status:", error)
          set({ error: "Failed to delete status", isLoading: false })
          return false
        }
      },

      reorderStatuses: async (statusIds) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/workflow/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statusIds }),
          })
          if (!response.ok) {
            throw new Error("Failed to reorder statuses")
          }
          const updatedSettings = await response.json()

          // Update the local state
          set({ settings: updatedSettings, isLoading: false })

          return true
        } catch (error) {
          console.error("Error reordering statuses:", error)
          set({ error: "Failed to reorder statuses", isLoading: false })
          return false
        }
      },

      archiveStatus: async (id) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/workflow/status/${id}/archive`, {
            method: "POST",
          })
          if (!response.ok) {
            throw new Error("Failed to archive status")
          }
          const updatedStatus = await response.json()

          // Update the local state
          set((state) => ({
            settings: state.settings
              ? {
                  ...state.settings,
                  statuses: state.settings.statuses.map((s) => (s.id === id ? updatedStatus : s)),
                }
              : null,
            isLoading: false,
          }))

          return true
        } catch (error) {
          console.error("Error archiving status:", error)
          set({ error: "Failed to archive status", isLoading: false })
          return false
        }
      },

      restoreStatus: async (id) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/workflow/status/${id}/restore`, {
            method: "POST",
          })
          if (!response.ok) {
            throw new Error("Failed to restore status")
          }
          const updatedStatus = await response.json()

          // Update the local state
          set((state) => ({
            settings: state.settings
              ? {
                  ...state.settings,
                  statuses: state.settings.statuses.map((s) => (s.id === id ? updatedStatus : s)),
                }
              : null,
            isLoading: false,
          }))

          return true
        } catch (error) {
          console.error("Error restoring status:", error)
          set({ error: "Failed to restore status", isLoading: false })
          return false
        }
      },

      createColumnGroup: async (group) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/workflow/column-group", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(group),
          })
          if (!response.ok) {
            throw new Error("Failed to create column group")
          }
          const newGroup = await response.json()

          // Update the local state
          set((state) => ({
            settings: state.settings
              ? {
                  ...state.settings,
                  columnGroups: [...state.settings.columnGroups, newGroup],
                }
              : null,
            isLoading: false,
          }))

          return newGroup
        } catch (error) {
          console.error("Error creating column group:", error)
          set({ error: "Failed to create column group", isLoading: false })
          return null
        }
      },

      updateColumnGroup: async (id, group) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/workflow/column-group/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(group),
          })
          if (!response.ok) {
            throw new Error("Failed to update column group")
          }
          const updatedGroup = await response.json()

          // Update the local state
          set((state) => ({
            settings: state.settings
              ? {
                  ...state.settings,
                  columnGroups: state.settings.columnGroups.map((g) => (g.id === id ? updatedGroup : g)),
                }
              : null,
            isLoading: false,
          }))

          return updatedGroup
        } catch (error) {
          console.error("Error updating column group:", error)
          set({ error: "Failed to update column group", isLoading: false })
          return null
        }
      },

      deleteColumnGroup: async (id) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch(`/api/workflow/column-group/${id}`, {
            method: "DELETE",
          })
          if (!response.ok) {
            throw new Error("Failed to delete column group")
          }

          // Update the local state
          set((state) => ({
            settings: state.settings
              ? {
                  ...state.settings,
                  columnGroups: state.settings.columnGroups.filter((g) => g.id !== id),
                }
              : null,
            isLoading: false,
          }))

          return true
        } catch (error) {
          console.error("Error deleting column group:", error)
          set({ error: "Failed to delete column group", isLoading: false })
          return false
        }
      },

      reorderColumnGroups: async (groupIds) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/workflow/column-group/reorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ groupIds }),
          })
          if (!response.ok) {
            throw new Error("Failed to reorder column groups")
          }
          const updatedSettings = await response.json()

          // Update the local state
          set({ settings: updatedSettings, isLoading: false })

          return true
        } catch (error) {
          console.error("Error reordering column groups:", error)
          set({ error: "Failed to reorder column groups", isLoading: false })
          return false
        }
      },

      toggleColumnGroupCollapse: async (id) => {
        set({ isLoading: true, error: null })
        try {
          const currentSettings = get().settings
          if (!currentSettings) {
            throw new Error("No workflow settings found")
          }

          const group = currentSettings.columnGroups.find((g) => g.id === id)
          if (!group) {
            throw new Error("Column group not found")
          }

          const response = await fetch(`/api/workflow/column-group/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isCollapsed: !group.isCollapsed }),
          })
          if (!response.ok) {
            throw new Error("Failed to toggle column group collapse")
          }
          const updatedGroup = await response.json()

          // Update the local state
          set((state) => ({
            settings: state.settings
              ? {
                  ...state.settings,
                  columnGroups: state.settings.columnGroups.map((g) => (g.id === id ? updatedGroup : g)),
                }
              : null,
            isLoading: false,
          }))

          return true
        } catch (error) {
          console.error("Error toggling column group collapse:", error)
          set({ error: "Failed to toggle column group collapse", isLoading: false })
          return false
        }
      },

      assignStatusToGroup: async (statusId, groupId) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/workflow/status/assign-group", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ statusId, groupId }),
          })
          if (!response.ok) {
            throw new Error("Failed to assign status to group")
          }
          const updatedSettings = await response.json()

          // Update the local state
          set({ settings: updatedSettings, isLoading: false })

          return true
        } catch (error) {
          console.error("Error assigning status to group:", error)
          set({ error: "Failed to assign status to group", isLoading: false })
          return false
        }
      },

      applyTemplate: async (templateIdOrTemplate) => {
        set({ isLoading: true, error: null })
        try {
          let updatedSettings

          if (typeof templateIdOrTemplate === "string") {
            // Apply a predefined template by ID
            updatedSettings = await postJSON("/api/workflow/apply-template", { templateId: templateIdOrTemplate })
          } else {
            // Apply a customized template
            updatedSettings = await postJSON("/api/workflow/apply-custom-template", { template: templateIdOrTemplate })
          }

          // Update the local state
          set({ settings: updatedSettings, isLoading: false })

          return true
        } catch (error) {
          console.error("Error applying template:", error)
          set({ error: "Failed to apply template", isLoading: false })
          return false
        }
      },

      updateSettings: async (settings) => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch("/api/workflow", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(settings),
          })
          if (!response.ok) {
            throw new Error("Failed to update workflow settings")
          }
          const updatedSettings = await response.json()

          // Update the local state
          set({ settings: updatedSettings, isLoading: false })

          return updatedSettings
        } catch (error) {
          console.error("Error updating workflow settings:", error)
          set({ error: "Failed to update workflow settings", isLoading: false })
          return null
        }
      },
    }),
    { name: "workflow-store" },
  ),
)
