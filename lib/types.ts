import type React from "react"
import type { TASK_STATUS, TASK_PRIORITY, NOTIFICATION_TYPES } from "./constants"

// User types
export interface User {
  id: string
  name: string
  email: string
  image: string | null
}

// Task types
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS]
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY]

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  createdAt: string
  updatedAt: string
  creatorId: string
  assigneeId: string | null
  creator: User | null
  assignee: User | null
  statusId?: string | null
  status_rel?: WorkflowStatus | null
  statusHistory?: StatusHistoryEntry[]
}

// New interface for status history
export interface StatusHistoryEntry {
  id: string
  taskId: string
  statusId: string
  statusName: string
  enteredAt: string
  exitedAt: string | null
}

export interface TaskFormData {
  title: string
  description?: string
  dueDate?: Date
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  statusId?: string
}

// Comment types
export interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  taskId: string
  userId: string
  user: User
}

export interface CommentFormData {
  content: string
}

// Notification types
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  userId: string
  taskId?: string
  task?: {
    id: string
    title: string
  }
  actionUrl?: string
}

export interface NotificationSettings {
  id: string
  taskAssigned: boolean
  taskUpdated: boolean
  taskCommented: boolean
  deadlineApproaching: boolean
  statusChanged: boolean
  userId: string
}

// Workflow types
export interface WorkflowSettings {
  id: string
  name: string
  description: string | null
  isDefault: boolean
  enforceWipLimits: boolean
  swimlaneProperty?: SwimlaneProperty | null
  showArchivedColumns: boolean
  enableTaskAging: boolean
  createdAt: string
  updatedAt: string
  userId: string
  statuses: WorkflowStatus[]
  columnGroups: ColumnGroup[]
}

export interface WorkflowStatus {
  id: string
  name: string
  description: string | null
  color: string
  order: number
  isDefault: boolean
  wipLimit?: number | null
  isArchived: boolean
  archivedAt?: string | null
  createdAt: string
  updatedAt: string
  workflowSettingsId: string
  columnGroupId?: string | null
  columnGroup?: ColumnGroup | null
  agingThresholds?: AgingThresholds
}

// New interface for aging thresholds
export interface AgingThresholds {
  warning: number // in hours
  critical: number // in hours
}

// Column group types
export interface ColumnGroup {
  id: string
  name: string
  description: string | null
  color: string | null
  order: number
  isCollapsed: boolean
  createdAt: string
  updatedAt: string
  workflowSettingsId: string
  statuses: WorkflowStatus[]
}

// Swimlane types
export type SwimlaneProperty = "assignee" | "priority" | "dueDate" | "none"

export interface Swimlane {
  id: string
  title: string
  value: string | null
  color?: string
  icon?: React.ReactNode
  isCollapsed?: boolean
}

// Workflow template types
export interface WorkflowTemplateStatus {
  name: string
  description: string | null
  color: string
  order: number
  wipLimit: number | null
  columnGroupName?: string | null
  agingThresholds?: AgingThresholds
}

export interface WorkflowTemplateGroup {
  name: string
  description: string | null
  color: string | null
  order: number
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  statuses: WorkflowTemplateStatus[]
  columnGroups?: WorkflowTemplateGroup[]
}

// New interface for customizable template
export interface CustomizableTemplate extends WorkflowTemplate {
  customName?: string
  customDescription?: string
  isCustomized?: boolean
}

// Auth types
export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
}

// API response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter types
export interface TaskFilter {
  status?: TaskStatus | "ALL"
  priority?: TaskPriority | "ALL"
  assigneeId?: string | "ALL"
  searchQuery?: string
  sortBy?: "dueDate" | "priority" | "title" | "createdAt"
  sortDirection?: "asc" | "desc"
}

// New type for column sorting
export type SortCriterion = "dueDate" | "priority" | "title" | "createdAt" | "assignee" | "updatedAt" | "timeInColumn"
export type SortDirection = "asc" | "desc"

export interface ColumnSortOptions {
  criterion: SortCriterion
  direction: SortDirection
}

// Component prop types
export interface TaskCardProps {
  task: Task
  onStatusChange?: (id: string, status: TaskStatus) => void
  onDelete?: (id: string) => void
}

export interface TaskFormProps {
  task?: Task
  onSubmit: (data: TaskFormData) => void
  isSubmitting?: boolean
}

export interface TaskFilterBarProps {
  filter: TaskFilter
  onFilterChange: (filter: Partial<TaskFilter>) => void
  onResetFilters: () => void
  users: User[]
  isLoading?: boolean
}

export interface TaskListProps {
  tasks: Task[]
  isLoading?: boolean
  onStatusChange?: (id: string, status: TaskStatus) => void
  onDelete?: (id: string) => void
}

export interface TaskSummaryProps {
  title: string
  count: number
  icon: React.ReactNode
  color: string
}

export interface CommentListProps {
  taskId: string
  comments: Comment[]
  isLoading?: boolean
  onDelete?: (id: string) => void
}

export interface CommentFormProps {
  taskId: string
  onCommentAdded?: (comment: Comment) => void
  initialContent?: string
  commentId?: string
  isEditing?: boolean
  onCancelEdit?: () => void
}

export interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}
