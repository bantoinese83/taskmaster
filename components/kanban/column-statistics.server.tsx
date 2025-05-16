import { Suspense } from "react"
import dynamic from "next/dynamic"
import { calculateMetrics } from "@/lib/metrics"
import type { Task, WorkflowStatus } from "@/lib/types"

const ColumnStatisticsClient = dynamic(() => import("./column-statistics.client"), {
  ssr: false,
  loading: () => <div>Loading stats...</div>,
})

interface ColumnStatisticsServerProps {
  columnId: string
  columnName: string
  columnColor: string
  tasks: Task[]
  status?: WorkflowStatus
  isLoading?: boolean
}

export default function ColumnStatisticsServer({
  columnId,
  columnName,
  columnColor,
  tasks,
  status,
  isLoading = false,
}: ColumnStatisticsServerProps) {
  const metrics = calculateMetrics(tasks, status)

  return (
    <Suspense fallback={<div>Loading stats...</div>}>
      <ColumnStatisticsClient
        columnId={columnId}
        columnName={columnName}
        columnColor={columnColor}
        metrics={metrics}
        isLoading={isLoading}
      />
    </Suspense>
  )
} 