"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sankey, type SankeyNode, type SankeyLink, ResponsiveContainer, Tooltip } from "recharts"
import type { Task, WorkflowStatus } from "@/lib/types"

interface ColumnFlowChartProps {
  columnId: string
  columnName: string
  columnColor: string
  tasks: Task[]
  statuses: WorkflowStatus[]
}

export function ColumnFlowChart({ columnId, columnName, columnColor, tasks, statuses }: ColumnFlowChartProps) {
  // Generate mock data for flow analysis
  const flowData = useMemo(() => {
    // In a real implementation, this would use actual task history data

    // Create nodes for all statuses
    const nodes: SankeyNode[] = statuses.map((status, index) => ({
      name: status.name,
      color: status.color,
      value: 0,
    }))

    // Add "External" node for tasks coming from outside the system
    nodes.push({
      name: "External",
      color: "#94a3b8",
      value: 0,
    })

    // Add "Completed" node for tasks that exit the system
    nodes.push({
      name: "Completed",
      color: "#22c55e",
      value: 0,
    })

    // Create links between nodes
    const links: SankeyLink[] = []

    // Mock data for incoming links
    const incomingLinks = [
      { source: "External", target: columnName, value: Math.floor(tasks.length * 0.4) },
      ...statuses
        .filter((status) => status.id !== columnId)
        .slice(0, 3) // Limit to 3 statuses for clarity
        .map((status, index) => ({
          source: status.name,
          target: columnName,
          value: Math.floor(tasks.length * (0.2 - index * 0.05)),
        })),
    ]

    // Mock data for outgoing links
    const outgoingLinks = [
      { source: columnName, target: "Completed", value: Math.floor(tasks.length * 0.3) },
      ...statuses
        .filter((status) => status.id !== columnId)
        .slice(0, 3) // Limit to 3 statuses for clarity
        .map((status, index) => ({
          source: columnName,
          target: status.name,
          value: Math.floor(tasks.length * (0.25 - index * 0.05)),
        })),
    ]

    return {
      nodes,
      links: [...incomingLinks, ...outgoingLinks].filter((link) => link.value > 0),
    }
  }, [columnId, columnName, columnColor, tasks, statuses])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Task Flow Analysis</CardTitle>
          <CardDescription>How tasks move in and out of this column</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            {tasks.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <Sankey
                  data={flowData}
                  nodePadding={50}
                  nodeWidth={10}
                  linkCurvature={0.5}
                  iterations={64}
                  link={{ stroke: "#d1d5db" }}
                >
                  <Tooltip />
                </Sankey>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No task flow data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Incoming Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.length > 0 ? `${(Math.random() * 5).toFixed(1)}/day` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Average tasks entering this column</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outgoing Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.length > 0 ? `${(Math.random() * 5).toFixed(1)}/day` : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Average tasks leaving this column</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
