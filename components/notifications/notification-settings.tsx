"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useNotifications } from "@/lib/hooks/use-notifications"
import { ROUTES } from "@/lib/constants"
import type { NotificationSettings as NotificationSettingsType } from "@/lib/types"

export default function NotificationSettings() {
  const { settings, isLoading, error, fetchSettings, updateSettings } = useNotifications()
  const router = useRouter()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleToggle = async (key: keyof NotificationSettingsType, value: boolean) => {
    if (!settings) return

    await updateSettings({
      [key]: value,
    })
  }

  const handleCancel = () => {
    router.push(ROUTES.NOTIFICATIONS)
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md">
        Error loading notification settings: {error}
      </div>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose which notifications you want to receive</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading || !settings ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-60" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taskAssigned">Task Assignments</Label>
                <p className="text-sm text-muted-foreground">Receive notifications when tasks are assigned to you</p>
              </div>
              <Switch
                id="taskAssigned"
                checked={settings.taskAssigned}
                onCheckedChange={(checked) => handleToggle("taskAssigned", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taskUpdated">Task Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when tasks you created or are assigned to are updated
                </p>
              </div>
              <Switch
                id="taskUpdated"
                checked={settings.taskUpdated}
                onCheckedChange={(checked) => handleToggle("taskUpdated", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="taskCommented">Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when someone comments on your tasks
                </p>
              </div>
              <Switch
                id="taskCommented"
                checked={settings.taskCommented}
                onCheckedChange={(checked) => handleToggle("taskCommented", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deadlineApproaching">Deadline Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when task deadlines are approaching
                </p>
              </div>
              <Switch
                id="deadlineApproaching"
                checked={settings.deadlineApproaching}
                onCheckedChange={(checked) => handleToggle("deadlineApproaching", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="statusChanged">Status Changes</Label>
                <p className="text-sm text-muted-foreground">Receive notifications when task statuses change</p>
              </div>
              <Switch
                id="statusChanged"
                checked={settings.statusChanged}
                onCheckedChange={(checked) => handleToggle("statusChanged", checked)}
              />
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-6">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={() => router.push(ROUTES.NOTIFICATIONS)}>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}
