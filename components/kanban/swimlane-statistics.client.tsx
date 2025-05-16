"use client"

import { useState } from "react"
import { BarChart3, CheckCircle2, Clock, AlertTriangle, Percent, PieChart, ChevronRight, ChevronLeft, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { SwimlaneMetrics } from "@/lib/swimlane-metrics"

interface SwimlaneStatisticsClientProps {
  swimlaneId: string
  swimlaneName: string
  metrics: SwimlaneMetrics
}

export default function SwimlaneStatisticsClient({
  swimlaneId,
  swimlaneName,
  metrics,
}: SwimlaneStatisticsClientProps) {
  const [currentMetric, setCurrentMetric] = useState<number>(0)

  // Define the metrics to display
  const metricTabs = [
    { name: "Task Count", icon: <BarChart3 className="h-4 w-4" /> },
    { name: "Completion Rate", icon: <Percent className="h-4 w-4" /> },
    { name: "Avg Time", icon: <Clock className="h-4 w-4" /> },
    { name: "Distribution", icon: <PieChart className="h-4 w-4" /> },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <BarChart3 className="h-4 w-4" />
          <span className="sr-only">Swimlane Statistics</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="p-4">
          <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {swimlaneName} Statistics
          </h3>
          <Tabs value={metricTabs[currentMetric].name} onValueChange={(val) => setCurrentMetric(metricTabs.findIndex(m => m.name === val))}>
            <TabsList className="w-full mb-4">
              {metricTabs.map((tab, idx) => (
                <TabsTrigger key={tab.name} value={tab.name} className="flex-1">
                  {tab.icon}
                  <span className="ml-1">{tab.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="Task Count">
              <div className="text-lg font-semibold">{metrics.completedTasks.length + metrics.inProgressTasks.length + metrics.todoTasks.length + metrics.blockedTasks.length} tasks</div>
            </TabsContent>
            <TabsContent value="Completion Rate">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-lg font-semibold">{metrics.completionRate}%</span>
              </div>
            </TabsContent>
            <TabsContent value="Avg Time">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-semibold">{metrics.avgTime}d</span>
              </div>
            </TabsContent>
            <TabsContent value="Distribution">
              <div className="space-y-2">
                {Object.entries(metrics.distribution).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-xs">
                    <span>{status}</span>
                    <span>{count} tasks</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  )
} 