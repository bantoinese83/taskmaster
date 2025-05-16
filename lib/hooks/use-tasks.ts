"use client"

import { useEffect } from "react"
import { useTaskStore } from "@/lib/store/task-store"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"

export function useTasks() {
  const {
    tasks,
    filteredTasks,
    isLoading,
    error,
    filter,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    setFilter,
    resetFilters,
  } = useTaskStore()

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const filterByStatus = (status: TaskStatus | "ALL") => {
    setFilter({ status })
  }

  const filterByPriority = (priority: TaskPriority | "ALL") => {
    setFilter({ priority })
  }

  const filterByAssignee = (assigneeId: string | "ALL") => {
    setFilter({ assigneeId })
  }

  const searchTasks = (searchQuery: string) => {
    setFilter({ searchQuery })
  }

  const sortTasks = (sortBy: "dueDate" | "priority" | "title" | "createdAt", sortDirection: "asc" | "desc" = "asc") => {
    setFilter({ sortBy, sortDirection })
  }

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter((task) => task.status === status)
  }

  const getTasksByPriority = (priority: TaskPriority): Task[] => {
    return tasks.filter((task) => task.priority === priority)
  }

  const getTasksByAssignee = (assigneeId: string): Task[] => {
    return tasks.filter((task) => task.assigneeId === assigneeId)
  }

  const getTasksDueSoon = (days = 3): Task[] => {
    const today = new Date()
    return tasks.filter((task) => {
      if (!task.dueDate || task.status === "COMPLETED") return false
      const dueDate = new Date(task.dueDate)
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= days && diffDays >= 0
    })
  }

  const getOverdueTasks = (): Task[] => {
    const today = new Date()
    return tasks.filter((task) => {
      if (!task.dueDate || task.status === "COMPLETED") return false
      const dueDate = new Date(task.dueDate)
      return dueDate < today
    })
  }

  return {
    tasks,
    filteredTasks,
    isLoading,
    error,
    filter,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    filterByStatus,
    filterByPriority,
    filterByAssignee,
    searchTasks,
    sortTasks,
    resetFilters,
    getTasksByStatus,
    getTasksByPriority,
    getTasksByAssignee,
    getTasksDueSoon,
    getOverdueTasks,
    setFilter,
  }
}
