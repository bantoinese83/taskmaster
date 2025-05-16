"use client"

import type React from "react"

import { forwardRef } from "react"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { Calendar, Clock, AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { priorityColorMap } from "@/lib/constants"
import { useTaskStore } from "@/lib/store/task-store"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { getTaskAgeInColumn, getAgingStatus } from "@/lib/utils/task-aging"
import type { Task, AgingStatus } from "@/lib/types"

interface KanbanTaskProps {
  task: Task
  isSelected?: boolean
  selectedRef?: React.RefObject<HTMLDivElement>
  columnColor?: string
  isOverlay?: boolean
  onClick?: () => void
}

export const KanbanTask = forwardRef<HTMLDivElement, KanbanTaskProps>(
  ({ task, isSelected, selectedRef, columnColor, isOverlay, onClick }, ref) => {
    // Format the due date if it exists
    const formattedDueDate = task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : null

    // Get the priority color
    const priorityColor = priorityColorMap[task.priority]

    // Get task selection state
    const { selectedTasks, toggleTaskSelection } = useTaskStore()
    const isTaskSelected = selectedTasks.has(task.id)

    // Get workflow settings
    const { settings, statuses } = useWorkflow()
    const enableTaskAging = settings?.enableTaskAging || false

    // Calculate task age in column
    const currentStatus = task.statusId
      ? statuses.find((s) => s.id === task.statusId)
      : statuses.find((s) => s.name === task.status)

    const ageInColumn = getTaskAgeInColumn(task)
    const agingStatus = currentStatus?.agingThresholds
      ? getAgingStatus(ageInColumn, currentStatus.agingThresholds)
      : "normal"

    // Get aging indicator styles
    const getAgingIndicatorStyles = (status: AgingStatus) => {
      switch (status) {
        case "warning":
          return {
            color: "text-amber-500",
            bg: "bg-amber-100",
            border: "border-amber-200",
          }
        case "critical":
          return {
            color: "text-red-500",
            bg: "bg-red-100",
            border: "border-red-200",
          }
        default:
          return {
            color: "text-muted-foreground",
            bg: "bg-transparent",
            border: "border-transparent",
          }
      }
    }

    const agingStyles = getAgingIndicatorStyles(agingStatus)

    // Format time in column
    const formatTimeInColumn = (hours: number) => {
      if (hours < 24) {
        return `${Math.round(hours)}h`
      } else {
        const days = Math.floor(hours / 24)
        return `${days}d ${Math.round(hours % 24)}h`
      }
    }

    // Handle task selection
    const handleTaskSelect = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      toggleTaskSelection(task.id)
    }

    return (
      <Card
        ref={selectedRef || ref}
        className={`cursor-pointer hover:shadow-md transition-shadow ${
          isSelected ? "ring-2 ring-primary ring-opacity-70" : ""
        } ${isTaskSelected ? "bg-primary/5 border-primary/30" : ""} ${
          enableTaskAging && agingStatus !== "normal"
            ? `border-l-4 ${agingStatus === "warning" ? "border-l-amber-500" : "border-l-red-500"}`
            : ""
        }`}
        onClick={onClick}
      >
        <div className="relative">
          {!isOverlay && (
            <div className="absolute left-2 top-3 z-10" onClick={handleTaskSelect}>
              <Checkbox
                checked={isTaskSelected}
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              />
            </div>
          )}

          <Link href={`/tasks/${task.id}`} className="block">
            <CardContent className={`p-3 ${!isOverlay ? "pl-8" : ""}`}>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium line-clamp-2">{task.title}</h3>
                  <Badge
                    variant="outline"
                    className="ml-2 shrink-0"
                    style={{
                      backgroundColor: `${priorityColor}20`,
                      color: priorityColor,
                      borderColor: `${priorityColor}40`,
                    }}
                  >
                    {task.priority}
                  </Badge>
                </div>

                {task.description && <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>}
              </div>
            </CardContent>

            <CardFooter className="p-3 pt-0 flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {task.assignee && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={task.assignee.image || undefined} alt={task.assignee.name} />
                    <AvatarFallback className="text-[10px]">
                      {task.assignee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                )}

                {enableTaskAging && ageInColumn > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`flex items-center gap-1 rounded-full px-2 py-0.5 ${agingStyles.bg} ${agingStyles.color}`}
                        >
                          {agingStatus !== "normal" && <AlertTriangle className="h-3 w-3" />}
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeInColumn(ageInColumn)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Time in column: {formatDistanceToNow(new Date(Date.now() - ageInColumn * 60 * 60 * 1000))}
                        </p>
                        {agingStatus === "warning" && (
                          <p className="text-amber-500">This task is aging and may need attention</p>
                        )}
                        {agingStatus === "critical" && (
                          <p className="text-red-500">This task has been in this column too long!</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              {formattedDueDate && (
                <div
                  className="flex items-center gap-1 rounded-full px-2 py-0.5"
                  style={{
                    backgroundColor: columnColor ? `${columnColor}15` : undefined,
                    color: columnColor,
                  }}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{formattedDueDate}</span>
                </div>
              )}
            </CardFooter>
          </Link>
        </div>
      </Card>
    )
  },
)

KanbanTask.displayName = "KanbanTask"
