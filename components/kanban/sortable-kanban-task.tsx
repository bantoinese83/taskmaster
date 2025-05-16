"use client"

import type React from "react"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanTask } from "@/components/kanban/kanban-task"
import type { Task } from "@/lib/types"

interface SortableKanbanTaskProps {
  task: Task
  isSelected?: boolean
  selectedRef?: React.RefObject<HTMLDivElement>
  columnColor?: string
}

export function SortableKanbanTask({ task, isSelected, selectedRef, columnColor }: SortableKanbanTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanTask task={task} isSelected={isSelected} selectedRef={selectedRef} columnColor={columnColor} />
    </div>
  )
}
