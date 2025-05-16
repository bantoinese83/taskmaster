"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { useTasks } from "@/lib/hooks/use-tasks"
import { ColumnTimeChart } from "@/components/analytics/column-time-chart"
import { ColumnFlowChart } from "@/components/analytics/column-flow-chart"
import { ColumnDistributionChart } from "@/components/analytics/column-distribution-chart"

export function ColumnAnalytics() {
  const { statuses } = useWorkflow()
  const { tasks } = useTasks()
  const [selectedColumn, setSelectedColumn] = useState<string>(statuses[0]?.id || "")

  // Get the selected column
  const selectedStatus = statuses.find((status) => status.id === selectedColumn)

  // Get tasks for the selected column
  const columnTasks = tasks.filter((task) => task.statusId === selectedColumn)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Column Analytics</CardTitle>
            <CardDescription>Detailed metrics and insights for workflow columns</CardDescription>
          </div>

          <Select value={selectedColumn} onValueChange={setSelectedColumn}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color }} />
                    <span>{status.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {selectedStatus ? (
          <Tabs defaultValue="time" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="time">Time Analysis</TabsTrigger>
              <TabsTrigger value="flow">Flow Analysis</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="time">
              <ColumnTimeChart
                columnId={selectedColumn}
                columnName={selectedStatus.name}
                columnColor={selectedStatus.color}
                tasks={columnTasks}
              />
            </TabsContent>

            <TabsContent value="flow">
              <ColumnFlowChart
                columnId={selectedColumn}
                columnName={selectedStatus.name}
                columnColor={selectedStatus.color}
                tasks={columnTasks}
                statuses={statuses}
              />
            </TabsContent>

            <TabsContent value="distribution">
              <ColumnDistributionChart
                columnId={selectedColumn}
                columnName={selectedStatus.name}
                columnColor={selectedStatus.color}
                tasks={columnTasks}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Select a column to view analytics
          </div>
        )}
      </CardContent>
    </Card>
  )
}
