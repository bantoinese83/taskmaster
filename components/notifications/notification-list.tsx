"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { NotificationItem } from "@/components/notifications/notification-item"
import { ROUTES } from "@/lib/constants"

export default function NotificationList() {
  const {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAllAsRead,
    deleteNotification,
    handleNotificationClick,
  } = useNotifications()
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  useEffect(() => {
    fetchNotifications(20, 1, activeTab === "unread")
  }, [fetchNotifications, activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    if (activeTab === "unread") {
      // Refresh the list after marking all as read
      fetchNotifications(20, 1, true)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
    // Refresh the list after deletion
    fetchNotifications(20, 1, activeTab === "unread")
  }

  const handleSettingsClick = () => {
    router.push(ROUTES.NOTIFICATION_SETTINGS)
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md">
        Error loading notifications: {error}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Your Notifications</CardTitle>
            <CardDescription>Stay updated on your tasks and team activities</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSettingsClick}>
              Notification Settings
            </Button>
            <Button onClick={handleMarkAllAsRead}>Mark All as Read</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderNotifications()}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            {renderNotifications()}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-6">
        {!isLoading && notifications.length > 0 && (
          <Button variant="outline" onClick={() => fetchNotifications(20, 1, activeTab === "unread")}>
            Refresh Notifications
          </Button>
        )}
      </CardFooter>
    </Card>
  )

  function renderNotifications() {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex gap-3 p-4 border rounded-md">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))
    }

    if (notifications.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          {activeTab === "unread" ? "No unread notifications" : "No notifications"}
        </div>
      )
    }

    return notifications.map((notification) => (
      <div key={notification.id} className="border rounded-md overflow-hidden">
        <NotificationItem
          notification={notification}
          onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
        />
      </div>
    ))
  }
}
