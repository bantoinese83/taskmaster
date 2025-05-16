import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TaskSummaryProps {
  title: string
  count: number
  icon: React.ReactNode
  color: "blue" | "yellow" | "green"
}

export function TaskSummary({ title, count, icon, color }: TaskSummaryProps) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300",
    yellow: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300",
    green: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-full ${colorClasses[color]}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        <p className="text-xs text-muted-foreground">{count === 1 ? "task" : "tasks"}</p>
      </CardContent>
    </Card>
  )
}
