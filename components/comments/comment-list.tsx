"use client"

import { useComments } from "@/lib/hooks/use-comments"
import { CommentItem } from "@/components/comments/comment-item"
import { CommentForm } from "@/components/comments/comment-form"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare } from "lucide-react"
import type { Comment } from "@/lib/types"

interface CommentListProps {
  taskId: string
}

export function CommentList({ taskId }: CommentListProps) {
  const { comments, isLoading, error, addComment, updateComment, deleteComment } = useComments(taskId)

  const handleCommentAdded = (comment: Comment) => {
    // The comment is already added to the store, this is just a hook for any additional actions
    console.log("Comment added:", comment)
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md">
        Error loading comments: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Comments</h3>
        <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium">
          {isLoading ? "..." : comments.length}
        </span>
      </div>

      <CommentForm taskId={taskId} onCommentAdded={handleCommentAdded} />

      <div className="space-y-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onUpdate={updateComment} onDelete={deleteComment} />
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">No comments yet. Be the first to comment!</div>
        )}
      </div>
    </div>
  )
}
