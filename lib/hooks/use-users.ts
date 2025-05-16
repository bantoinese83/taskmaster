"use client"

import { useEffect } from "react"
import { useUserStore } from "@/lib/store/user-store"

export function useUsers() {
  const { users, isLoading, error, fetchUsers } = useUserStore()

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const getUserById = (id: string) => {
    return users.find((user) => user.id === id) || null
  }

  const getUsersByIds = (ids: string[]) => {
    return users.filter((user) => ids.includes(user.id))
  }

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    getUserById,
    getUsersByIds,
  }
}
