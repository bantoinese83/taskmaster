import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Notification, NotificationSettings } from "@/lib/types"

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  settings: NotificationSettings | null
  isLoading: boolean
  error: string | null
}

interface NotificationActions {
  fetchNotifications: (limit?: number, page?: number, unreadOnly?: boolean) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  fetchSettings: () => Promise<void>
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>
}

type NotificationStore = NotificationState & NotificationActions

export const useNotificationStore = create<NotificationStore>()(
  devtools((set, get) => ({
    notifications: [],
    unreadCount: 0,
    settings: null,
    isLoading: false,
    error: null,

    fetchNotifications: async (limit = 10, page = 1, unreadOnly = false) => {
      set({ isLoading: true, error: null })
      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString(),
          unreadOnly: unreadOnly.toString(),
        })

        const response = await fetch(`/api/notifications?${params.toString()}`)
        if (!response.ok) {
          throw new Error("Failed to fetch notifications")
        }

        const data = await response.json()
        set({
          notifications: data.notifications,
          isLoading: false,
        })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "An unknown error occurred",
          isLoading: false,
        })
      }
    },

    fetchUnreadCount: async () => {
      try {
        const response = await fetch("/api/notifications?limit=1&page=1&unreadOnly=true")
        if (!response.ok) {
          throw new Error("Failed to fetch unread count")
        }

        const data = await response.json()
        set({ unreadCount: data.pagination.total })
      } catch (error) {
        console.error("Error fetching unread count:", error)
      }
    },

    markAsRead: async (id: string) => {
      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isRead: true }),
        })

        if (!response.ok) {
          throw new Error("Failed to mark notification as read")
        }

        // Update local state
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, isRead: true } : notification,
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }))
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    },

    markAllAsRead: async () => {
      try {
        const response = await fetch("/api/notifications/mark-all-read", {
          method: "POST",
        })

        if (!response.ok) {
          throw new Error("Failed to mark all notifications as read")
        }

        // Update local state
        set((state) => ({
          notifications: state.notifications.map((notification) => ({ ...notification, isRead: true })),
          unreadCount: 0,
        }))
      } catch (error) {
        console.error("Error marking all notifications as read:", error)
      }
    },

    deleteNotification: async (id: string) => {
      try {
        const response = await fetch(`/api/notifications/${id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete notification")
        }

        // Update local state
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id)
          const unreadCount = notification && !notification.isRead ? state.unreadCount - 1 : state.unreadCount

          return {
            notifications: state.notifications.filter((notification) => notification.id !== id),
            unreadCount: Math.max(0, unreadCount),
          }
        })
      } catch (error) {
        console.error("Error deleting notification:", error)
      }
    },

    fetchSettings: async () => {
      set({ isLoading: true, error: null })
      try {
        const response = await fetch("/api/notifications/settings")
        if (!response.ok) {
          throw new Error("Failed to fetch notification settings")
        }

        const settings = await response.json()
        set({
          settings,
          isLoading: false,
        })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "An unknown error occurred",
          isLoading: false,
        })
      }
    },

    updateSettings: async (settings: Partial<NotificationSettings>) => {
      set({ isLoading: true, error: null })
      try {
        const response = await fetch("/api/notifications/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        })

        if (!response.ok) {
          throw new Error("Failed to update notification settings")
        }

        const updatedSettings = await response.json()
        set({
          settings: updatedSettings,
          isLoading: false,
        })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "An unknown error occurred",
          isLoading: false,
        })
      }
    },
  })),
)
