"use client"

import {
  Chart,
  ChartTooltip,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Legend,
  Cell,
} from "@/components/ui/chart"

interface TaskPriorityChartProps {
  highPriorityTasks: number
  mediumPriorityTasks: number
  lowPriorityTasks: number
}

export function TaskPriorityChart({
  highPriorityTasks,
  mediumPriorityTasks,
  lowPriorityTasks,
}: TaskPriorityChartProps) {
  const data = [
    { name: "High", value: highPriorityTasks, color: "#ef4444" },
    { name: "Medium", value: mediumPriorityTasks, color: "#f97316" },
    { name: "Low", value: lowPriorityTasks, color: "#6b7280" },
  ]

  if (data.every((item) => item.value === 0)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No task data available</p>
      </div>
    )
  }

  return (
    <Chart className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={80} />
          <ChartTooltip formatter={(value) => [`${value} tasks`, ""]} />
          <Legend />
          <Bar dataKey="value" barSize={30}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </Chart>
  )
}
