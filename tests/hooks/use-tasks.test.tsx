import { renderHook, act } from "@testing-library/react"
import { useTasks } from "@/lib/hooks/use-tasks"
import { useTaskStore } from "@/lib/store/task-store"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"

// Mock the task store
jest.mock("@/lib/store/task-store", () => ({
  useTaskStore: jest.fn(),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

describe("useTasks hook", () => {
  const mockTasks: Task[] = [
    {
      id: "1",
      title: "Task 1",
      description: "Description 1",
      status: "TODO" as TaskStatus,
      priority: "HIGH" as TaskPriority,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creatorId: "user1",
      assigneeId: "user2",
      creator: null,
      assignee: null,
    },
    {
      id: "2",
      title: "Task 2",
      description: "Description 2",
      status: "IN_PROGRESS" as TaskStatus,
      priority: "MEDIUM" as TaskPriority,
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creatorId: "user1",
      assigneeId: null,
      creator: null,
      assignee: null,
    },
  ]

  const mockFilteredTasks = [...mockTasks]

  const mockStore = {
    tasks: mockTasks,
    filteredTasks: mockFilteredTasks,
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
    fetchTasks: jest.fn(),
    addTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    setFilter: jest.fn(),
    resetFilters: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTaskStore as jest.Mock).mockReturnValue(mockStore)
  })

  it("should return tasks and loading state", () => {
    const { result } = renderHook(() => useTasks())

    expect(result.current.tasks).toEqual(mockTasks)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("should call fetchTasks on mount", () => {
    renderHook(() => useTasks())

    expect(mockStore.fetchTasks).toHaveBeenCalledTimes(1)
  })

  it("should filter tasks by status", () => {
    const { result } = renderHook(() => useTasks())

    const todoTasks = result.current.getTasksByStatus("TODO")
    expect(todoTasks).toHaveLength(1)
    expect(todoTasks[0].id).toBe("1")

    const inProgressTasks = result.current.getTasksByStatus("IN_PROGRESS")
    expect(inProgressTasks).toHaveLength(1)
    expect(inProgressTasks[0].id).toBe("2")
  })

  it("should filter tasks by priority", () => {
    const { result } = renderHook(() => useTasks())

    const highPriorityTasks = result.current.getTasksByPriority("HIGH")
    expect(highPriorityTasks).toHaveLength(1)
    expect(highPriorityTasks[0].id).toBe("1")
  })

  it("should set status filter", () => {
    const { result } = renderHook(() => useTasks())

    act(() => {
      result.current.filterByStatus("TODO")
    })

    expect(mockStore.setFilter).toHaveBeenCalledWith({ status: "TODO" })
  })

  it("should set priority filter", () => {
    const { result } = renderHook(() => useTasks())

    act(() => {
      result.current.filterByPriority("HIGH")
    })

    expect(mockStore.setFilter).toHaveBeenCalledWith({ priority: "HIGH" })
  })

  it("should reset filters", () => {
    const { result } = renderHook(() => useTasks())

    act(() => {
      result.current.resetFilters()
    })

    expect(mockStore.resetFilters).toHaveBeenCalledTimes(1)
  })
})
