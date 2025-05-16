import { render, screen, fireEvent } from "@testing-library/react"
import { TaskCard } from "@/components/tasks/task-card"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { useTasks } from "@/lib/hooks/use-tasks"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/lib/types"

// Mock the hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

jest.mock("@/lib/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}))

jest.mock("@/lib/hooks/use-tasks", () => ({
  useTasks: jest.fn(),
}))

jest.mock("@/hooks/use-toast", () => ({
  useToast: jest.fn(),
}))

describe("TaskCard", () => {
  const mockTask: Task = {
    id: "1",
    title: "Test Task",
    description: "This is a test task",
    status: "TODO",
    priority: "HIGH",
    dueDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    creatorId: "user1",
    assigneeId: "user2",
    creator: {
      id: "user1",
      name: "John Doe",
      email: "john@example.com",
      image: null,
    },
    assignee: {
      id: "user2",
      name: "Jane Smith",
      email: "jane@example.com",
      image: null,
    },
  }

  const mockRouter = {
    push: jest.fn(),
  }

  const mockAuth = {
    user: {
      id: "user1",
    },
  }

  const mockDeleteTask = jest.fn()
  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useAuth as jest.Mock).mockReturnValue(mockAuth)
    ;(useTasks as jest.Mock).mockReturnValue({
      deleteTask: mockDeleteTask,
    })
    ;(useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    })
  })

  it("renders task details correctly", () => {
    render(<TaskCard task={mockTask} />)

    expect(screen.getByText("Test Task")).toBeInTheDocument()
    expect(screen.getByText("This is a test task")).toBeInTheDocument()
    expect(screen.getByText("To Do")).toBeInTheDocument()
    expect(screen.getByText("High Priority")).toBeInTheDocument()
    expect(screen.getByText("Assigned to Jane Smith")).toBeInTheDocument()
  })

  it("shows edit and delete options for task creator", () => {
    render(<TaskCard task={mockTask} />)

    // Open dropdown menu
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }))

    expect(screen.getByText("Edit")).toBeInTheDocument()
    expect(screen.getByText("Delete")).toBeInTheDocument()
  })

  it("does not show edit and delete options for non-creators", () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      user: {
        id: "user3", // Different user
      },
    })

    render(<TaskCard task={mockTask} />)

    // Dropdown menu should not be visible
    expect(screen.queryByRole("button", { name: /open menu/i })).not.toBeInTheDocument()
  })

  it("navigates to edit page when edit is clicked", () => {
    render(<TaskCard task={mockTask} />)

    // Open dropdown menu
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }))

    // Click edit
    fireEvent.click(screen.getByText("Edit"))

    expect(mockRouter.push).toHaveBeenCalledWith(`/tasks/${mockTask.id}/edit`)
  })

  it("calls deleteTask when delete is clicked", async () => {
    mockDeleteTask.mockResolvedValue(undefined)

    render(<TaskCard task={mockTask} />)

    // Open dropdown menu
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }))

    // Click delete
    fireEvent.click(screen.getByText("Delete"))

    expect(mockDeleteTask).toHaveBeenCalledWith(mockTask.id)
    expect(mockToast).toHaveBeenCalledWith({
      title: "Task deleted",
      description: "The task has been successfully deleted",
    })
  })

  it("shows error toast when delete fails", async () => {
    mockDeleteTask.mockRejectedValue(new Error("Delete failed"))

    render(<TaskCard task={mockTask} />)

    // Open dropdown menu
    fireEvent.click(screen.getByRole("button", { name: /open menu/i }))

    // Click delete
    fireEvent.click(screen.getByText("Delete"))

    // Wait for the promise to resolve
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mockToast).toHaveBeenCalledWith({
      title: "Error",
      description: "Failed to delete task. Please try again.",
      variant: "destructive",
    })
  })
})
