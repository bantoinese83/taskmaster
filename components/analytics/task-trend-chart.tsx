"use client"

import {
  Chart,
  ChartTooltip,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Area,
} from "@/components/ui/chart"
import { format, parseISO } from "date-fns"

interface TaskTrendChartProps {
  completedTasksByDay: Array<{
    date: string
    count: number
  }>
}

export function TaskTrendChart({ completedTasksByDay }: TaskTrendChartProps) {
  if (completedTasksByDay.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No trend data available</p>
      </div>
    )
  }

  return (
    <Chart className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={completedTasksByDay}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(parseISO(value), "MMM d")}
            interval={Math.ceil(completedTasksByDay.length / 10)}
          />
          <YAxis allowDecimals={false} />
          <ChartTooltip
            labelFormatter={(value) => format(parseISO(value), "MMMM d, yyyy")}
            formatter={(value) => [`${value} tasks completed`, ""]}
          />
          <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" />
          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </Chart>
  )
}
