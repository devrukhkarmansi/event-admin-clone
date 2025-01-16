"use client"

import { useRouter, usePathname } from "next/navigation"
import { Home, Calendar, Users, LayoutGrid, Settings, LogOut, GitBranch, MapPin, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"
import { SidebarHeader, SidebarNav, SidebarNavItem } from "@/components/ui/sidebar"
import { FloatingThemeToggle as ThemeToggle } from "@/components/floating-theme-toggle"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/auth-store"
import { useUser } from "@/hooks/use-auth"
import React, { useState } from "react"
import Image from "next/image"
import { useEvent } from '@/hooks/use-events'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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
    title: "Locations",
    href: "/dashboard/locations",
    icon: MapPin
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings
  }
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser, isAuthenticated, clearAuth } = useAuthStore()
  const { data: event } = useEvent()
  const { data } = useUser()
  const [collapsed, setCollapsed] = useState(false)

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
    <div className={cn(
      "flex flex-col h-screen sticky top-0 border-r bg-background transition-all duration-300 relative",
      collapsed ? "w-[80px]" : "w-[240px]"
    )}>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
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
            <span className={cn(
              "text-lg font-semibold transition-opacity duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100"
            )}>
              Events Admin
            </span>
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </SidebarHeader>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 h-6 w-6 p-0.5 rounded-full border bg-background shadow-md z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>

      <SidebarNav className="flex-1 px-3 py-4 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => (
          <SidebarNavItem 
            key={item.href}
            href={item.href}
            className={cn(
              pathname === item.href && "bg-accent text-accent-foreground"
            )}
            icon={
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                <span className={cn(
                  "transition-all duration-300",
                  collapsed ? "opacity-0 w-0 hidden" : "opacity-100"
                )}>
                  {item.title}
                </span>
              </div>
            }
          >
          </SidebarNavItem>
        ))}
      </SidebarNav>

      <div className={cn(
        "border-t transition-all duration-300",
        collapsed ? "p-2" : "p-4"
      )}>
        {user && (
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "gap-3"
          )}>
            <Avatar>
              <AvatarImage src={user.profileImage?.url} />
              <AvatarFallback>
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "min-w-0 flex-1 transition-all duration-300",
              collapsed ? "hidden" : "block"
            )}>
              <div className="font-medium truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-muted-foreground truncate">
                {user.email}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  )
} 