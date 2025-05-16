"use client"

import { formatDistanceToNow } from "date-fns"
import { Bell, MessageSquare, Clock, AlertCircle, RefreshCw, Flag } from "lucide-react"
import { cn } from "@/lib/utils"
import { NOTIFICATION_TYPES } from "@/lib/constants"
import type { Notification } from "@/lib/types"

interface NotificationItemProps {
  notification: Notification
  onClick?: () => void
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.TASK_ASSIGNED:
        return <Bell className="h-5 w-5 text-blue-500" />
      case NOTIFICATION_TYPES.TASK_COMMENTED:
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case NOTIFICATION_TYPES.DEADLINE_APPROACHING:
        return <Clock className="h-5 w-5 text-yellow-500" />
      case NOTIFICATION_TYPES.STATUS_CHANGED:
        return <RefreshCw className="h-5 w-5 text-purple-500" />
      case NOTIFICATION_TYPES.PRIORITY_CHANGED:
        return <Flag className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div
      className={cn("flex w-full cursor-pointer gap-3 px-4 py-3 hover:bg-muted", !notification.isRead && "bg-muted/50")}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-1">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between">
          <p className={cn("text-sm font-medium", !notification.isRead && "font-semibold")}>{notification.title}</p>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        {notification.task && (
          <p className="text-xs text-primary">
            Task: <span className="font-medium">{notification.task.title}</span>
          </p>
        )}
      </div>
    </div>
  )
}
