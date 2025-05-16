"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { CommentForm } from "@/components/comments/comment-form"
import { useToast } from "@/hooks/use-toast"
import type { Comment } from "@/lib/types"

interface CommentItemProps {
  comment: Comment
  onUpdate: (commentId: string, content: string) => Promise<Comment>
  onDelete: (commentId: string) => Promise<void>
}

export function CommentItem({ comment, onUpdate, onDelete }: CommentItemProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = session?.user?.id === comment.userId

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(comment.id)
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <CommentForm
        taskId={comment.taskId}
        initialContent={comment.content}
        commentId={comment.id}
        isEditing={true}
        onCancelEdit={handleCancelEdit}
      />
    )
  }

  return (
    <div className="flex gap-4">
      <Avatar className="h-10 w-10">
        <AvatarImage src={comment.user.image || ""} alt={comment.user.name} />
        <AvatarFallback>
          {comment.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt !== comment.createdAt && <span className="text-xs text-muted-foreground">(edited)</span>}
          </div>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Comment actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 dark:text-red-400">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this comment? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="text-sm whitespace-pre-wrap">{comment.content}</div>
      </div>
    </div>
  )
}
