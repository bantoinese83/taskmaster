"use client"

import { useState } from "react"
import { Filter, X, Check, User, Calendar, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { useUsers } from "@/lib/hooks/use-users"
import { TASK_PRIORITY, TASK_PRIORITY_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Task, TaskPriority } from "@/lib/types"

export interface ColumnFilterOptions {
  assignees: string[]
  priorities: TaskPriority[]
  dueDateRange: {
    overdue: boolean
    today: boolean
    thisWeek: boolean
    later: boolean
    noDueDate: boolean
  }
}

interface ColumnFilterProps {
  columnId: string
  columnName: string
  columnColor: string
  onFilterChange: (columnId: string, filters: ColumnFilterOptions) => void
  activeFilters: ColumnFilterOptions | null
  tasks: Task[]
}

export function ColumnFilter({
  columnId,
  columnName,
  columnColor,
  onFilterChange,
  activeFilters,
  tasks,
}: ColumnFilterProps) {
  const { users } = useUsers()
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<ColumnFilterOptions>(
    activeFilters || {
      assignees: [],
      priorities: [],
      dueDateRange: {
        overdue: false,
        today: false,
        thisWeek: false,
        later: false,
        noDueDate: false,
      },
    },
  )

  // Count active filters
  const countActiveFilters = () => {
    let count = 0
    count += filters.assignees.length
    count += filters.priorities.length
    count += Object.values(filters.dueDateRange).filter(Boolean).length
    return count
  }

  const activeFilterCount = countActiveFilters()

  // Apply filters
  const applyFilters = () => {
    onFilterChange(columnId, filters)
    setOpen(false)
  }

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {
      assignees: [],
      priorities: [],
      dueDateRange: {
        overdue: false,
        today: false,
        thisWeek: false,
        later: false,
        noDueDate: false,
      },
    }
    setFilters(emptyFilters)
    onFilterChange(columnId, emptyFilters)
    setOpen(false)
  }

  // Toggle assignee filter
  const toggleAssignee = (userId: string) => {
    setFilters((prev) => {
      const newAssignees = prev.assignees.includes(userId)
        ? prev.assignees.filter((id) => id !== userId)
        : [...prev.assignees, userId]
      return { ...prev, assignees: newAssignees }
    })
  }

  // Toggle priority filter
  const togglePriority = (priority: TaskPriority) => {
    setFilters((prev) => {
      const newPriorities = prev.priorities.includes(priority)
        ? prev.priorities.filter((p) => p !== priority)
        : [...prev.priorities, priority]
      return { ...prev, priorities: newPriorities }
    })
  }

  // Toggle due date range filter
  const toggleDueDateRange = (range: keyof ColumnFilterOptions["dueDateRange"]) => {
    setFilters((prev) => ({
      ...prev,
      dueDateRange: {
        ...prev.dueDateRange,
        [range]: !prev.dueDateRange[range],
      },
    }))
  }

  // Get counts for each filter option
  const getAssigneeCounts = () => {
    const counts: Record<string, number> = { unassigned: 0 }
    tasks.forEach((task) => {
      if (!task.assigneeId) {
        counts.unassigned++
      } else {
        counts[task.assigneeId] = (counts[task.assigneeId] || 0) + 1
      }
    })
    return counts
  }

  const getPriorityCounts = () => {
    const counts: Record<string, number> = {}
    tasks.forEach((task) => {
      counts[task.priority] = (counts[task.priority] || 0) + 1
    })
    return counts
  }

  const getDueDateCounts = () => {
    const counts = {
      overdue: 0,
      today: 0,
      thisWeek: 0,
      later: 0,
      noDueDate: 0,
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    tasks.forEach((task) => {
      if (!task.dueDate) {
        counts.noDueDate++
      } else {
        const dueDate = new Date(task.dueDate)
        if (dueDate < today) {
          counts.overdue++
        } else if (dueDate.getTime() === today.getTime()) {
          counts.today++
        } else if (dueDate < nextWeek) {
          counts.thisWeek++
        } else {
          counts.later++
        }
      }
    })

    return counts
  }

  const assigneeCounts = getAssigneeCounts()
  const priorityCounts = getPriorityCounts()
  const dueDateCounts = getDueDateCounts()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7 rounded-full", activeFilterCount > 0 && "bg-primary/10 text-primary")}
        >
          <Filter className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
          <span className="sr-only">Filter column tasks</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Filter tasks in ${columnName}...`} />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No filter options found.</CommandEmpty>

            {/* Assignee filters */}
            <CommandGroup heading="Assignee">
              <CommandItem onSelect={() => toggleAssignee("unassigned")} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.assignees.includes("unassigned")}
                  onCheckedChange={() => toggleAssignee("unassigned")}
                  id="unassigned"
                />
                <User className="h-4 w-4 text-muted-foreground mr-1" />
                <span>Unassigned</span>
                <Badge variant="outline" className="ml-auto">
                  {assigneeCounts.unassigned || 0}
                </Badge>
              </CommandItem>

              {users.map((user) => (
                <CommandItem key={user.id} onSelect={() => toggleAssignee(user.id)} className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.assignees.includes(user.id)}
                    onCheckedChange={() => toggleAssignee(user.id)}
                    id={user.id}
                  />
                  <span className="flex-1 truncate">{user.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {assigneeCounts[user.id] || 0}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {/* Priority filters */}
            <CommandGroup heading="Priority">
              {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                <CommandItem
                  key={value}
                  onSelect={() => togglePriority(value as TaskPriority)}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={filters.priorities.includes(value as TaskPriority)}
                    onCheckedChange={() => togglePriority(value as TaskPriority)}
                    id={value}
                  />
                  <Flag className="h-4 w-4 text-muted-foreground mr-1" />
                  <span>{TASK_PRIORITY_LABELS[value as TaskPriority]}</span>
                  <Badge variant="outline" className="ml-auto">
                    {priorityCounts[value] || 0}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            {/* Due date filters */}
            <CommandGroup heading="Due Date">
              <CommandItem onSelect={() => toggleDueDateRange("overdue")} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.dueDateRange.overdue}
                  onCheckedChange={() => toggleDueDateRange("overdue")}
                  id="overdue"
                />
                <Calendar className="h-4 w-4 text-destructive mr-1" />
                <span>Overdue</span>
                <Badge variant="outline" className="ml-auto">
                  {dueDateCounts.overdue}
                </Badge>
              </CommandItem>

              <CommandItem onSelect={() => toggleDueDateRange("today")} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.dueDateRange.today}
                  onCheckedChange={() => toggleDueDateRange("today")}
                  id="today"
                />
                <Calendar className="h-4 w-4 text-warning mr-1" />
                <span>Due Today</span>
                <Badge variant="outline" className="ml-auto">
                  {dueDateCounts.today}
                </Badge>
              </CommandItem>

              <CommandItem onSelect={() => toggleDueDateRange("thisWeek")} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.dueDateRange.thisWeek}
                  onCheckedChange={() => toggleDueDateRange("thisWeek")}
                  id="thisWeek"
                />
                <Calendar className="h-4 w-4 text-primary mr-1" />
                <span>This Week</span>
                <Badge variant="outline" className="ml-auto">
                  {dueDateCounts.thisWeek}
                </Badge>
              </CommandItem>

              <CommandItem onSelect={() => toggleDueDateRange("later")} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.dueDateRange.later}
                  onCheckedChange={() => toggleDueDateRange("later")}
                  id="later"
                />
                <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                <span>Later</span>
                <Badge variant="outline" className="ml-auto">
                  {dueDateCounts.later}
                </Badge>
              </CommandItem>

              <CommandItem onSelect={() => toggleDueDateRange("noDueDate")} className="flex items-center gap-2">
                <Checkbox
                  checked={filters.dueDateRange.noDueDate}
                  onCheckedChange={() => toggleDueDateRange("noDueDate")}
                  id="noDueDate"
                />
                <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                <span>No Due Date</span>
                <Badge variant="outline" className="ml-auto">
                  {dueDateCounts.noDueDate}
                </Badge>
              </CommandItem>
            </CommandGroup>
          </CommandList>

          <div className="flex items-center justify-between p-2 border-t">
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8">
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
            <Button size="sm" onClick={applyFilters} className="text-xs h-8">
              <Check className="h-3 w-3 mr-1" />
              Apply Filters
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
