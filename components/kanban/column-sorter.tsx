"use client"

import type React from "react"

import { useState } from "react"
import { ArrowDownAZ, ArrowDownUp, Calendar, Clock, Flag, User, RefreshCw, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SortCriterion, SortDirection, ColumnSortOptions } from "@/lib/types"

interface ColumnSorterProps {
  columnId: string
  columnName: string
  columnColor: string
  onSortChange: (columnId: string, sortOptions: ColumnSortOptions) => void
  activeSortOptions: ColumnSortOptions | null
}

export function ColumnSorter({
  columnId,
  columnName,
  columnColor,
  onSortChange,
  activeSortOptions,
}: ColumnSorterProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Sort criteria options
  const sortCriteria: Array<{ value: SortCriterion; label: string; icon: React.ReactNode }> = [
    { value: "dueDate", label: "Due Date", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { value: "priority", label: "Priority", icon: <Flag className="h-4 w-4 mr-2" /> },
    { value: "title", label: "Title", icon: <ArrowDownAZ className="h-4 w-4 mr-2" /> },
    { value: "createdAt", label: "Created Date", icon: <Clock className="h-4 w-4 mr-2" /> },
    { value: "updatedAt", label: "Updated Date", icon: <RefreshCw className="h-4 w-4 mr-2" /> },
    { value: "assignee", label: "Assignee", icon: <User className="h-4 w-4 mr-2" /> },
  ]

  // Handle sort selection
  const handleSortSelect = (criterion: SortCriterion, direction: SortDirection) => {
    onSortChange(columnId, { criterion, direction })
    setIsOpen(false)
  }

  // Get icon for current sort
  const getSortIcon = () => {
    if (!activeSortOptions) return <ArrowDownUp className="h-4 w-4" />

    switch (activeSortOptions.criterion) {
      case "dueDate":
        return <Calendar className="h-4 w-4" />
      case "priority":
        return <Flag className="h-4 w-4" />
      case "title":
        return <ArrowDownAZ className="h-4 w-4" />
      case "createdAt":
        return <Clock className="h-4 w-4" />
      case "updatedAt":
        return <RefreshCw className="h-4 w-4" />
      case "assignee":
        return <User className="h-4 w-4" />
      default:
        return <ArrowDownUp className="h-4 w-4" />
    }
  }

  const handleSortChange = (columnId: string, direction: 'asc' | 'desc' | null) => {
    onSortChange(columnId, direction as unknown);
  };

  return (
    <TooltipProvider>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                style={{
                  color: activeSortOptions ? columnColor : undefined,
                }}
              >
                {getSortIcon()}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Sort tasks in this column</p>
            {activeSortOptions && (
              <p className="text-xs text-muted-foreground">
                Currently sorted by {sortCriteria.find((c) => c.value === activeSortOptions.criterion)?.label} (
                {activeSortOptions.direction === "asc" ? "ascending" : "descending"})
              </p>
            )}
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Sort {columnName} Tasks</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {sortCriteria.map((criterion) => (
              <DropdownMenuGroup key={criterion.value}>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground py-1">
                  {criterion.label}
                </DropdownMenuLabel>
                <DropdownMenuItem
                  className="flex items-center justify-between"
                  onClick={() => handleSortSelect(criterion.value, "asc")}
                >
                  <div className="flex items-center">
                    {criterion.icon}
                    <span>Ascending</span>
                  </div>
                  {activeSortOptions?.criterion === criterion.value && activeSortOptions?.direction === "asc" && (
                    <Check className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center justify-between"
                  onClick={() => handleSortSelect(criterion.value, "desc")}
                >
                  <div className="flex items-center">
                    {criterion.icon}
                    <span>Descending</span>
                  </div>
                  {activeSortOptions?.criterion === criterion.value && activeSortOptions?.direction === "desc" && (
                    <Check className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-muted-foreground"
            onClick={() => {
              onSortChange(columnId, null as unknown)
              setIsOpen(false)
            }}
            disabled={!activeSortOptions}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Reset to Default</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
