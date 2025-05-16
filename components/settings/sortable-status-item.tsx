"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Pencil, Trash2, Archive, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useWorkflow } from "@/lib/hooks/use-workflow"
import { useToast } from "@/hooks/use-toast"
import type { WorkflowStatus } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface SortableStatusItemProps {
  status: WorkflowStatus
  onEdit: (status: WorkflowStatus) => void
}

export function SortableStatusItem({ status, onEdit }: SortableStatusItemProps) {
  const { deleteStatus, archiveStatus, unarchiveStatus } = useWorkflow()
  const { toast } = useToast()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: status.id,
    disabled: status.isArchived,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  // Calculate text color based on background color brightness
  const getTextColor = (hexColor: string) => {
    // Convert hex to RGB
    const r = Number.parseInt(hexColor.slice(1, 3), 16)
    const g = Number.parseInt(hexColor.slice(3, 5), 16)
    const b = Number.parseInt(hexColor.slice(5, 7), 16)

    // Calculate brightness (YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000

    // Return white for dark colors, black for light colors
    return brightness > 128 ? "#000000" : "#FFFFFF"
  }

  const handleDelete = async () => {
    try {
      await deleteStatus(status.id)
      toast({
        title: "Column deleted",
        description: "The column has been permanently deleted",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete column",
        variant: "destructive",
      })
    }
  }

  const handleArchive = async () => {
    try {
      await archiveStatus(status.id)
      toast({
        title: "Column archived",
        description: "The column has been archived and can be restored later",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to archive column",
        variant: "destructive",
      })
    }
  }

  const handleUnarchive = async () => {
    try {
      await unarchiveStatus(status.id)
      toast({
        title: "Column restored",
        description: "The column has been restored to the board",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to restore column",
        variant: "destructive",
      })
    }
  }

  const textColor = getTextColor(status.color)

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`relative border ${status.isArchived ? "bg-muted/30" : ""} ${
        status.isDefault ? "border-primary/50" : ""
      }`}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {!status.isArchived && (
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-medium"
              style={{
                backgroundColor: status.color,
                color: textColor,
              }}
            >
              {status.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium">{status.name}</div>
              {status.description && (
                <div className="text-xs text-muted-foreground line-clamp-1">{status.description}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status.wipLimit && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs">
                      WIP: {status.wipLimit}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Work-in-progress limit: {status.wipLimit}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {status.isDefault && (
              <Badge variant="secondary" className="text-xs">
                Default
              </Badge>
            )}

            {status.isArchived && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                      Archived
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Archived{" "}
                      {status.archivedAt ? formatDistanceToNow(new Date(status.archivedAt), { addSuffix: true }) : ""}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!status.isArchived && (
            <>
              <Button variant="ghost" size="icon" onClick={() => onEdit(status)} className="h-8 w-8">
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleArchive}
                      className="h-8 w-8 text-amber-600"
                      disabled={status.isDefault}
                    >
                      <Archive className="h-4 w-4" />
                      <span className="sr-only">Archive</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Archive column (hide without deleting)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={status.isDefault}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Column</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this column? All tasks will be moved to the default column. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          {status.isArchived && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={handleUnarchive} className="h-8 w-8 text-primary">
                      <RotateCcw className="h-4 w-4" />
                      <span className="sr-only">Restore</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Restore column to the board</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled={status.isDefault}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Archived Column</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete this archived column? All tasks will be moved to the
                      default column. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
