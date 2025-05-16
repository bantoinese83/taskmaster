"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface SignInCredentials {
  email: string
  password: string
}

interface SignUpCredentials extends SignInCredentials {
  name: string
  confirmPassword: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (credentials: SignInCredentials) => {
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        toast({
          title: "Error",
          description: "Invalid email or password",
          variant: "destructive",
        })
        return false
      }

      toast({
        title: "Success",
        description: "Signed in successfully",
      })

      router.push("/")
      router.refresh()
      return true
    } catch (error) {
      console.error("Sign in error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (credentials: SignUpCredentials) => {
    setIsLoading(true)

    try {
      if (credentials.password !== credentials.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        })
        return false
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: credentials.name,
          email: credentials.email,
          password: credentials.password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to register")
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully",
      })

      // Sign in the user after successful registration
      return handleSignIn({
        email: credentials.email,
        password: credentials.password,
      })
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/auth/signin")
    router.refresh()
  }

  return {
    session,
    status,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || isLoading,
    user: session?.user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  }
}
