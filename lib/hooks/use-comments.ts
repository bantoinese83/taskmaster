"use client"

import { useEffect, useState } from "react"
import { useCommentStore } from "@/lib/store/comment-store"
import type { Comment } from "@/lib/types"

export function useComments(taskId: string) {
  const { comments, isLoading, error, fetchComments, addComment, updateComment, deleteComment } = useCommentStore()
  const [taskComments, setTaskComments] = useState<Comment[]>([])

  useEffect(() => {
    fetchComments(taskId)
  }, [fetchComments, taskId])

  useEffect(() => {
    setTaskComments(comments[taskId] || [])
  }, [comments, taskId])

  const addTaskComment = async (content: string) => {
    return await addComment(taskId, content)
  }

  const updateTaskComment = async (commentId: string, content: string) => {
    return await updateComment(commentId, content)
  }

  const deleteTaskComment = async (commentId: string) => {
    return await deleteComment(commentId, taskId)
  }

  return {
    comments: taskComments,
    isLoading,
    error,
    addComment: addTaskComment,
    updateComment: updateTaskComment,
    deleteComment: deleteTaskComment,
  }
}
