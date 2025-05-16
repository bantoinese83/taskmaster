"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PlusCircle, CheckCircle, ListTodo, Home, User, BarChart, Trello } from "lucide-react"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { ROUTES } from "@/lib/constants"

export default function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const navigation = [
    { name: "Dashboard", href: ROUTES.HOME, icon: Home },
    { name: "Tasks", href: ROUTES.TASKS, icon: ListTodo },
    { name: "Kanban", href: ROUTES.KANBAN, icon: Trello },
    { name: "Analytics", href: ROUTES.ANALYTICS, icon: BarChart },
    { name: "New Task", href: ROUTES.NEW_TASK, icon: PlusCircle },
  ]

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">TaskMaster</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-1 ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center space-x-4">
          {session && <NotificationBell />}
          <ModeToggle />

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback>
                      {session.user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.NOTIFICATIONS}>Notifications</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href={ROUTES.SIGN_IN}>Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
