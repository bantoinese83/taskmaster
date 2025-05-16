import { ColumnAnalytics } from "@/components/analytics/column-analytics"

export default function ColumnAnalyticsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Column Analytics</h1>
        <p className="text-muted-foreground">Detailed metrics and insights for your workflow columns</p>
      </div>

      <ColumnAnalytics />
    </div>
  )
}
