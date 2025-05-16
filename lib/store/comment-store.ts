import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { Comment } from "@/lib/types"

interface CommentState {
  comments: Record<string, Comment[]>
  isLoading: boolean
  error: string | null
}

interface CommentActions {
  fetchComments: (taskId: string) => Promise<void>
  addComment: (taskId: string, content: string) => Promise<Comment>
  updateComment: (commentId: string, content: string) => Promise<Comment>
  deleteComment: (commentId: string, taskId: string) => Promise<void>
}

type CommentStore = CommentState & CommentActions

export const useCommentStore = create<CommentStore>()(
  devtools((set, get) => ({
    comments: {},
    isLoading: false,
    error: null,

    fetchComments: async (taskId: string) => {
      set((state) => ({ ...state, isLoading: true, error: null }))
      try {
        const response = await fetch(`/api/tasks/${taskId}/comments`)
        if (!response.ok) {
          throw new Error("Failed to fetch comments")
        }
        const comments = await response.json()
        set((state) => ({
          ...state,
          comments: {
            ...state.comments,
            [taskId]: comments,
          },
          isLoading: false,
        }))
      } catch (error) {
        set((state) => ({
          ...state,
          error: error instanceof Error ? error.message : "An unknown error occurred",
          isLoading: false,
        }))
      }
    },

    addComment: async (taskId: string, content: string) => {
      set((state) => ({ ...state, isLoading: true, error: null }))
      try {
        const response = await fetch(`/api/tasks/${taskId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        })

        if (!response.ok) {
          throw new Error("Failed to add comment")
        }

        const newComment = await response.json()
        set((state) => {
          const taskComments = state.comments[taskId] || []
          return {
            ...state,
            comments: {
              ...state.comments,
              [taskId]: [...taskComments, newComment],
            },
            isLoading: false,
          }
        })
        return newComment
      } catch (error) {
        set((state) => ({
          ...state,
          error: error instanceof Error ? error.message : "An unknown error occurred",
          isLoading: false,
        }))
        throw error
      }
    },

    updateComment: async (commentId: string, content: string) => {
      set((state) => ({ ...state, isLoading: true, error: null }))
      try {
        const response = await fetch(`/api/comments/${commentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        })

        if (!response.ok) {
          throw new Error("Failed to update comment")
        }

        const updatedComment = await response.json()
        set((state) => {
          const taskId = updatedComment.taskId
          const taskComments = state.comments[taskId] || []
          return {
            ...state,
            comments: {
              ...state.comments,
              [taskId]: taskComments.map((comment) => (comment.id === commentId ? updatedComment : comment)),
            },
            isLoading: false,
          }
        })
        return updatedComment
      } catch (error) {
        set((state) => ({
          ...state,
          error: error instanceof Error ? error.message : "An unknown error occurred",
          isLoading: false,
        }))
        throw error
      }
    },

    deleteComment: async (commentId: string, taskId: string) => {
      set((state) => ({ ...state, isLoading: true, error: null }))
      try {
        const response = await fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete comment")
        }

        set((state) => {
          const taskComments = state.comments[taskId] || []
          return {
            ...state,
            comments: {
              ...state.comments,
              [taskId]: taskComments.filter((comment) => comment.id !== commentId),
            },
            isLoading: false,
          }
        })
      } catch (error) {
        set((state) => ({
          ...state,
          error: error instanceof Error ? error.message : "An unknown error occurred",
          isLoading: false,
        }))
        throw error
      }
    },
  })),
)
