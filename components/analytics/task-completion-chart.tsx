"use client"

import { Chart, ChartTooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "@/components/ui/chart"

interface TaskCompletionChartProps {
  completionRate: number
}

export function TaskCompletionChart({ completionRate }: TaskCompletionChartProps) {
  const data = [
    { name: "Completed", value: completionRate, color: "#22c55e" },
    { name: "Remaining", value: 100 - completionRate, color: "#e5e7eb" },
  ]

  return (
    <Chart className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} />
          <ChartTooltip formatter={(value) => [`${value}%`, ""]} />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-3xl font-bold"
            fill="currentColor"
          >
            {completionRate}%
          </text>
        </PieChart>
      </ResponsiveContainer>
    </Chart>
  )
}
