import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, AlertCircle, AlertTriangle, BarChart } from "lucide-react"

interface TaskMetricsGridProps {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  overdueTasks: number
  completionRate: number
}

export function TaskMetricsGrid({
  totalTasks,
  completedTasks,
  inProgressTasks,
  todoTasks,
  overdueTasks,
  completionRate,
}: TaskMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Tasks</CardDescription>
          <CardTitle className="text-3xl">{totalTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center">
            <BarChart className="h-4 w-4 mr-1" />
            <span className="text-sm">All tasks</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Completed</CardDescription>
          <CardTitle className="text-3xl text-green-600">{completedTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center">
            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
            <span className="text-sm">{completionRate}% completion rate</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>In Progress</CardDescription>
          <CardTitle className="text-3xl text-yellow-600">{inProgressTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 text-yellow-600" />
            <span className="text-sm">Active tasks</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>To Do</CardDescription>
          <CardTitle className="text-3xl text-blue-600">{todoTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center">
            <Clock className="h-4 w-4 mr-1 text-blue-600" />
            <span className="text-sm">Pending tasks</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Overdue</CardDescription>
          <CardTitle className="text-3xl text-red-600">{overdueTasks}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />
            <span className="text-sm">Past due date</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
