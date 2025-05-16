export * from "./colors"
export * from "./typography"
export * from "./spacing"

export const APP_NAME = "TaskMaster"

export const TASK_STATUS = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const

export const TASK_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: "TASK_ASSIGNED",
  TASK_UPDATED: "TASK_UPDATED",
  TASK_COMMENTED: "TASK_COMMENTED",
  DEADLINE_APPROACHING: "DEADLINE_APPROACHING",
  STATUS_CHANGED: "STATUS_CHANGED",
  PRIORITY_CHANGED: "PRIORITY_CHANGED",
} as const

export const NOTIFICATION_TITLES = {
  [NOTIFICATION_TYPES.TASK_ASSIGNED]: "Task Assigned",
  [NOTIFICATION_TYPES.TASK_UPDATED]: "Task Updated",
  [NOTIFICATION_TYPES.TASK_COMMENTED]: "New Comment",
  [NOTIFICATION_TYPES.DEADLINE_APPROACHING]: "Deadline Approaching",
  [NOTIFICATION_TYPES.STATUS_CHANGED]: "Status Changed",
  [NOTIFICATION_TYPES.PRIORITY_CHANGED]: "Priority Changed",
} as const

export const SORT_OPTIONS = {
  DUE_DATE: "dueDate",
  PRIORITY: "priority",
  TITLE: "title",
  CREATED_AT: "createdAt",
} as const

export const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc",
} as const

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: "To Do",
  [TASK_STATUS.IN_PROGRESS]: "In Progress",
  [TASK_STATUS.COMPLETED]: "Completed",
} as const

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: "Low",
  [TASK_PRIORITY.MEDIUM]: "Medium",
  [TASK_PRIORITY.HIGH]: "High",
} as const

export const DATE_FORMATS = {
  FULL: "PPP",
  SHORT: "PP",
  TIME: "p",
  FULL_WITH_TIME: "PPp",
} as const

export const ROUTES = {
  HOME: "/",
  TASKS: "/tasks",
  NEW_TASK: "/tasks/new",
  TASK_DETAIL: (id: string) => `/tasks/${id}`,
  EDIT_TASK: (id: string) => `/tasks/${id}/edit`,
  SIGN_IN: "/auth/signin",
  SIGN_UP: "/auth/signup",
  ANALYTICS: "/analytics",
  KANBAN: "/kanban",
  NOTIFICATIONS: "/notifications",
  NOTIFICATION_SETTINGS: "/notifications/settings",
} as const

export const API_ROUTES = {
  TASKS: "/api/tasks",
  TASK: (id: string) => `/api/tasks/${id}`,
  TASK_COMMENTS: (id: string) => `/api/tasks/${id}/comments`,
  COMMENT: (id: string) => `/api/comments/${id}`,
  USERS: "/api/users",
  REGISTER: "/api/auth/register",
  NOTIFICATIONS: "/api/notifications",
  NOTIFICATION: (id: string) => `/api/notifications/${id}`,
  MARK_ALL_READ: "/api/notifications/mark-all-read",
  NOTIFICATION_SETTINGS: "/api/notifications/settings",
} as const

export const LOCAL_STORAGE_KEYS = {
  THEME: "taskmaster-theme",
  TASK_FILTER: "taskmaster-task-filter",
} as const
