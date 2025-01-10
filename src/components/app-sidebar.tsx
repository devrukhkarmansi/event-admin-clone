"use client"

import { useRouter } from "next/navigation"
import { Home, Calendar, Users, LayoutGrid, Settings, LogOut } from "lucide-react"
import { SidebarHeader, SidebarNav, SidebarNavItem } from "@/components/ui/sidebar"
import { FloatingThemeToggle as ThemeToggle } from "@/components/floating-theme-toggle"
import { Avatar } from "@/components/ui/avatar"
import { useAuthStore } from "@/store/auth-store"
import { useUser } from "@/hooks/use-auth"
import React from "react"

export function AppSidebar() {
  const router = useRouter()
  const { user, setUser, isAuthenticated, clearAuth } = useAuthStore()
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
    <div className="flex flex-col h-screen">
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center justify-between w-full">
          <h2 className="font-semibold">Events Admin</h2>
          <ThemeToggle />
        </div>
      </SidebarHeader>

      <SidebarNav className="flex-1 px-3 py-4">
        <SidebarNavItem href="/dashboard" icon={<Home size={20} />}>
          Dashboard
        </SidebarNavItem>
        <SidebarNavItem href="/dashboard/event" icon={<Calendar size={20} />}>
          Events
        </SidebarNavItem>
        <SidebarNavItem href="/dashboard/sessions" icon={<LayoutGrid size={20} />}>
          Sessions
        </SidebarNavItem>
        <SidebarNavItem href="/dashboard/users" icon={<Users size={20} />}>
          Users
        </SidebarNavItem>
        <SidebarNavItem href="/dashboard/settings" icon={<Settings size={20} />}>
          Settings
        </SidebarNavItem>
      </SidebarNav>

      <div className="border-t p-4">
        {user && (
          <div className="mb-4 px-2 flex items-center gap-3">
            <Avatar 
              src={user.profileImage?.url} 
              className="h-12 w-12"
            />
            <div>
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-muted-foreground">
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