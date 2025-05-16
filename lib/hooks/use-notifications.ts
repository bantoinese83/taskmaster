"use client"

import { useEffect } from "react"
import { useNotificationStore } from "@/lib/store/notification-store"
import { useRouter } from "next/navigation"

export function useNotifications() {
  const {
    notifications,
    unreadCount,
    settings,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchSettings,
    updateSettings,
  } = useNotificationStore()
  const router = useRouter()

  useEffect(() => {
    fetchUnreadCount()
    // Poll for new notifications every minute
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 60000)

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  const handleNotificationClick = async (notificationId: string, actionUrl?: string) => {
    await markAsRead(notificationId)
    if (actionUrl) {
      router.push(actionUrl)
    }
  }

  return {
    notifications,
    unreadCount,
    settings,
    isLoading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchSettings,
    updateSettings,
    handleNotificationClick,
  }
}
