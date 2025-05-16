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

interface TaskAssigneeChartProps {
  tasksByAssignee: Array<{
    name: string
    value: number
  }>
}

export function TaskAssigneeChart({ tasksByAssignee }: TaskAssigneeChartProps) {
  if (tasksByAssignee.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No assignee data available</p>
      </div>
    )
  }

  // Sort by number of tasks (descending)
  const sortedData = [...tasksByAssignee].sort((a, b) => b.value - a.value)

  // Generate colors based on index
  const data = sortedData.map((item, index) => {
    // Generate a color based on index (blue hue with varying saturation)
    const hue = 210
    const saturation = 80 - index * 5
    const lightness = 55
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`

    return {
      ...item,
      color,
    }
  })

  return (
    <Chart className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            tickFormatter={(value) => {
              return value.length > 12 ? `${value.substring(0, 12)}...` : value
            }}
          />
          <ChartTooltip formatter={(value, name, props) => [`${value} tasks`, props.payload.name]} />
          <Legend />
          <Bar dataKey="value" name="Tasks" barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </Chart>
  )
}
