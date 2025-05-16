"use client"

import { useEffect, useState } from "react"
import { useTasks } from "@/lib/hooks/use-tasks"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { SwimlaneAnalytics } from "@/components/analytics/swimlane-analytics"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SwimlaneProperty } from "@/lib/types"

export default function SwimlaneAnalyticsPage() {
  const { tasks, isLoading } = useTasks()
  const { statuses, settings } = useWorkflow()
  const [selectedSwimlaneProperty, setSelectedSwimlaneProperty] = useState<SwimlaneProperty>("assignee")

  useEffect(() => {
    if (settings?.swimlaneProperty) {
      setSelectedSwimlaneProperty(settings.swimlaneProperty)
    }
  }, [settings?.swimlaneProperty])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Swimlane Analytics</h1>
        <Select
          value={selectedSwimlaneProperty}
          onValueChange={(value) => setSelectedSwimlaneProperty(value as SwimlaneProperty)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Swimlane property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assignee">By Assignee</SelectItem>
            <SelectItem value="priority">By Priority</SelectItem>
            <SelectItem value="dueDate">By Due Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SwimlaneAnalytics tasks={tasks} statuses={statuses} swimlaneProperty={selectedSwimlaneProperty} />
    </div>
  )
}
