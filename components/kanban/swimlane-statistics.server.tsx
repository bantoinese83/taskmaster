import { Suspense } from "react"
import dynamic from "next/dynamic"
import { calculateSwimlaneMetrics } from "@/lib/swimlane-metrics"
import type { Task, WorkflowStatus } from "@/lib/types"

const SwimlaneStatisticsClient = dynamic(() => import("./swimlane-statistics.client"), {
  ssr: false,
  loading: () => <div>Loading swimlane stats...</div>,
})

interface SwimlaneStatisticsServerProps {
  swimlaneId: string
  swimlaneName: string
  tasks: Task[]
  statuses: WorkflowStatus[]
}

function SwimlaneStatistics({
  swimlaneId,
  swimlaneName,
  tasks,
  statuses,
}: SwimlaneStatisticsServerProps) {
  const metrics = calculateSwimlaneMetrics(tasks, statuses)

  return (
    <Suspense fallback={<div>Loading swimlane stats...</div>}>
      <SwimlaneStatisticsClient
        swimlaneId={swimlaneId}
        swimlaneName={swimlaneName}
        metrics={metrics}
      />
    </Suspense>
  )
}

export default SwimlaneStatistics
export { SwimlaneStatistics } 