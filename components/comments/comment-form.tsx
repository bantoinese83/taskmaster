"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useCommentStore } from "@/lib/store/comment-store"
import { useToast } from "@/hooks/use-toast"
import type { Comment } from "@/lib/types"

const formSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
})

interface CommentFormProps {
  taskId: string
  onCommentAdded?: (comment: Comment) => void
  initialContent?: string
  commentId?: string
  isEditing?: boolean
  onCancelEdit?: () => void
}

export function CommentForm({
  taskId,
  onCommentAdded,
  initialContent = "",
  commentId,
  isEditing = false,
  onCancelEdit,
}: CommentFormProps) {
  const { addComment, updateComment } = useCommentStore()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<{ content: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: initialContent,
    },
  })

  const onSubmit = async (values: { content: string }) => {
    setIsSubmitting(true)

    try {
      if (isEditing && commentId) {
        // Update existing comment
        const updatedComment = await updateComment(commentId, values.content)
        toast({
          title: "Comment updated",
          description: "Your comment has been updated successfully",
        })
        if (onCancelEdit) {
          onCancelEdit()
        }
      } else {
        // Add new comment
        const newComment = await addComment(taskId, values.content)
        if (onCommentAdded) {
          onCommentAdded(newComment)
        }
        form.reset({ content: "" })
        toast({
          title: "Comment added",
          description: "Your comment has been added successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Add a comment..."
                  className="min-h-24 resize-none"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          {isEditing && onCancelEdit && (
            <Button type="button" variant="outline" onClick={onCancelEdit} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? "Updating..." : "Posting...") : isEditing ? "Update Comment" : "Post Comment"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
