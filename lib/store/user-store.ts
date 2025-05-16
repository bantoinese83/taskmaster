import { create } from "zustand"
import { devtools } from "zustand/middleware"
import type { User } from "@/lib/types"

interface UserState {
  users: User[]
  isLoading: boolean
  error: string | null
}

interface UserActions {
  fetchUsers: () => Promise<void>
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>()(
  devtools((set) => ({
    users: [],
    isLoading: false,
    error: null,

    fetchUsers: async () => {
      set({ isLoading: true, error: null })
      try {
        const response = await fetch("/api/users")
        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }
        const users = await response.json()
        set({ users, isLoading: false })
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : "An unknown error occurred",
          isLoading: false,
        })
      }
    },
  })),
)
