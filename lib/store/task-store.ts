import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"

// Define the store state type
interface TaskState {
  tasks: Task[]
  filteredTasks: Task[]
  selectedTasks: Set<string>
  isLoading: boolean
  error: string | null
  filter: {
    status: TaskStatus | "ALL"
    priority: TaskPriority | "ALL"
    assigneeId: string | "ALL"
    searchQuery: string
    sortBy: "dueDate" | "priority" | "title" | "createdAt"
    sortDirection: "asc" | "desc"
  }
}

// Define the store actions type
interface TaskActions {
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "creator" | "assignee">) => Promise<Task>
  updateTask: (id: string, task: Partial<Task>) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  setFilter: (filter: Partial<TaskState["filter"]>) => void
  resetFilters: () => void
  applyFilters: () => void
  selectTask: (id: string) => void
  deselectTask: (id: string) => void
  toggleTaskSelection: (id: string) => void
  selectAllTasks: (ids: string[]) => void
  deselectAllTasks: () => void
  bulkUpdateTasks: (taskIds: string[], updates: Partial<Task>) => Promise<void>
}

// Combine state and actions
type TaskStore = TaskState & TaskActions

// Create the store
export const useTaskStore = create<TaskStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        tasks: [],
        filteredTasks: [],
        selectedTasks: new Set<string>(),
        isLoading: false,
        error: null,
        filter: {
          status: "ALL",
          priority: "ALL",
          assigneeId: "ALL",
          searchQuery: "",
          sortBy: "dueDate",
          sortDirection: "asc",
        },

        // Add this at the top, after imports
        defaultFilter: {
          status: "ALL",
          priority: "ALL",
          assigneeId: "ALL",
          searchQuery: "",
          sortBy: "dueDate",
          sortDirection: "asc",
        },

        // Actions
        fetchTasks: async () => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch("/api/tasks")
            if (!response.ok) {
              throw new Error("Failed to fetch tasks")
            }
            const tasks = await response.json()
            set({ tasks, filteredTasks: tasks, isLoading: false })
            get().applyFilters()
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "An unknown error occurred",
              isLoading: false,
            })
          }
        },

        addTask: async (task) => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch("/api/tasks", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(task),
            })

            if (!response.ok) {
              throw new Error("Failed to add task")
            }

            const newTask = await response.json()
            set((state) => ({
              tasks: [...state.tasks, newTask],
              isLoading: false,
            }))
            get().applyFilters()
            return newTask
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "An unknown error occurred",
              isLoading: false,
            })
            throw error
          }
        },

        updateTask: async (id, taskUpdate) => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch(`/api/tasks/${id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(taskUpdate),
            })

            if (!response.ok) {
              throw new Error("Failed to update task")
            }

            const updatedTask = await response.json()
            set((state) => ({
              tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
              isLoading: false,
            }))
            get().applyFilters()
            return updatedTask
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "An unknown error occurred",
              isLoading: false,
            })
            throw error
          }
        },

        deleteTask: async (id) => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch(`/api/tasks/${id}`, {
              method: "DELETE",
            })

            if (!response.ok) {
              throw new Error("Failed to delete task")
            }

            set((state) => ({
              tasks: state.tasks.filter((task) => task.id !== id),
              isLoading: false,
            }))
            get().applyFilters()
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "An unknown error occurred",
              isLoading: false,
            })
            throw error
          }
        },

        setFilter: (filterUpdate) => {
          set((state) => ({
            filter: {
              ...defaultFilter,
              ...state.filter,
              ...filterUpdate,
            },
          }))
          get().applyFilters()
        },

        resetFilters: () => {
          set({
            filter: {
              status: "ALL",
              priority: "ALL",
              assigneeId: "ALL",
              searchQuery: "",
              sortBy: "dueDate",
              sortDirection: "asc",
            },
          })
          get().applyFilters()
        },

        applyFilters: () => {
          const { tasks, filter } = get()

          let filtered = [...tasks]

          // Apply status filter
          if (filter.status !== "ALL") {
            filtered = filtered.filter((task) => task.status === filter.status)
          }

          // Apply priority filter
          if (filter.priority !== "ALL") {
            filtered = filtered.filter((task) => task.priority === filter.priority)
          }

          // Apply assignee filter
          if (filter.assigneeId !== "ALL") {
            filtered = filtered.filter((task) => task.assigneeId === filter.assigneeId)
          }

          // Apply search query
          if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase()
            filtered = filtered.filter(
              (task) =>
                task.title.toLowerCase().includes(query) ||
                (task.description && task.description.toLowerCase().includes(query)),
            )
          }

          // Apply sorting
          filtered.sort((a, b) => {
            switch (filter.sortBy) {
              case "dueDate":
                // Handle null due dates
                if (!a.dueDate && !b.dueDate) return 0
                if (!a.dueDate) return filter.sortDirection === "asc" ? 1 : -1
                if (!b.dueDate) return filter.sortDirection === "asc" ? -1 : 1
                return filter.sortDirection === "asc"
                  ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                  : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()

              case "priority":
                const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
                return filter.sortDirection === "asc"
                  ? priorityOrder[a.priority] - priorityOrder[b.priority]
                  : priorityOrder[b.priority] - priorityOrder[a.priority]

              case "title":
                return filter.sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)

              case "createdAt":
                return filter.sortDirection === "asc"
                  ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

              default:
                return 0
            }
          })

          set({ filteredTasks: filtered })
        },

        // Task selection actions
        selectTask: (id) => {
          set((state) => {
            const newSelectedTasks = new Set(state.selectedTasks)
            newSelectedTasks.add(id)
            return { selectedTasks: newSelectedTasks }
          })
        },

        deselectTask: (id) => {
          set((state) => {
            const newSelectedTasks = new Set(state.selectedTasks)
            newSelectedTasks.delete(id)
            return { selectedTasks: newSelectedTasks }
          })
        },

        toggleTaskSelection: (id) => {
          set((state) => {
            const newSelectedTasks = new Set(state.selectedTasks)
            if (newSelectedTasks.has(id)) {
              newSelectedTasks.delete(id)
            } else {
              newSelectedTasks.add(id)
            }
            return { selectedTasks: newSelectedTasks }
          })
        },

        selectAllTasks: (ids) => {
          set((state) => {
            const newSelectedTasks = new Set(state.selectedTasks)
            ids.forEach((id) => newSelectedTasks.add(id))
            return { selectedTasks: newSelectedTasks }
          })
        },

        deselectAllTasks: () => {
          set({ selectedTasks: new Set() })
        },

        // Bulk update tasks
        bulkUpdateTasks: async (taskIds, updates) => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch("/api/tasks/bulk-update", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ taskIds, updates }),
            })

            if (!response.ok) {
              throw new Error("Failed to update tasks")
            }

            const updatedTasks = await response.json()

            // Update tasks in the store
            set((state) => ({
              tasks: state.tasks.map((task) => {
                const updatedTask = updatedTasks.find((t: Task) => t.id === task.id)
                return updatedTask || task
              }),
              isLoading: false,
              // Clear selection after successful update
              selectedTasks: new Set(),
            }))

            get().applyFilters()
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "An unknown error occurred",
              isLoading: false,
            })
            throw error
          }
        },
      }),
      {
        name: "task-store",
        partialize: (state) => ({ filter: state.filter }),
      },
    ),
  ),
)
