"use client"

import { useRouter } from "next/navigation"
import { Home, Calendar, Users, LayoutGrid, Settings, LogOut, GitBranch } from "lucide-react"
import { SidebarHeader, SidebarNav, SidebarNavItem } from "@/components/ui/sidebar"
import { FloatingThemeToggle as ThemeToggle } from "@/components/floating-theme-toggle"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth-store"
import { useUser } from "@/hooks/use-auth"
import React from "react"
import Image from "next/image"
import { useEvent } from '@/hooks/use-events'

const NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    title: "Event & Sponsors",
    href: "/dashboard/event",
    icon: Calendar
  },
  {
    title: "Tracks",
    href: "/dashboard/tracks",
    icon: GitBranch
  },
  {
    title: "Sessions",
    href: "/dashboard/sessions",
    icon: LayoutGrid
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings
  }
]

export function AppSidebar() {
  const router = useRouter()
  const { user, setUser, isAuthenticated, clearAuth } = useAuthStore()
  const { data: event } = useEvent()
  const { data } = useUser()

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (data) {
      setUser(data)
    }
  }, [data, setUser, isAuthenticated, router])

  const handleLogout = () => {
    clearAuth()
    router.push("/login")
  }

  return (
    <div className="flex flex-col h-screen sticky top-0 border-r bg-background w-[240px]">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center">
            {event?.logo ? (
              <Image
                src={event.logo.url}
                alt="Event Logo"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            ) : (
              <Calendar className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
          <span className="text-lg font-semibold">Events Admin</span>
          <div className="ml-auto flex items-center pr-2">
            <ThemeToggle />
          </div>
        </div>
      </SidebarHeader>

      <SidebarNav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => (
          <SidebarNavItem 
            key={item.href} 
            href={item.href} 
            icon={<item.icon size={20} />}
          >
            {item.title}
          </SidebarNavItem>
        ))}
      </SidebarNav>

      <div className="border-t p-4">
        {user && (
          <div className="mb-4 px-2 flex items-center gap-3">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={user.profileImage?.url} alt="User avatar" />
              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  )
} 