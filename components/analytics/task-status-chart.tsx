"use client"

import { Chart, ChartTooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "@/components/ui/chart"

interface TaskStatusChartProps {
  todoTasks: number
  inProgressTasks: number
  completedTasks: number
}

export function TaskStatusChart({ todoTasks, inProgressTasks, completedTasks }: TaskStatusChartProps) {
  const data = [
    { name: "To Do", value: todoTasks, color: "#3b82f6" },
    { name: "In Progress", value: inProgressTasks, color: "#eab308" },
    { name: "Completed", value: completedTasks, color: "#22c55e" },
  ].filter((item) => item.value > 0)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No task data available</p>
      </div>
    )
  }

  return (
    <Chart className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} />
          <ChartTooltip formatter={(value) => [`${value} tasks`, ""]} />
        </PieChart>
      </ResponsiveContainer>
    </Chart>
  )
}
