"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function Sidebar({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">{children}</div>
    </div>
  )
}

export function SidebarHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex h-16 items-center px-4", className)}>{children}</div>
  )
}

export function SidebarNav({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <nav className={cn("space-y-2", className)}>{children}</nav>
}

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  icon?: React.ReactNode
}

export function SidebarNavItem({ href, icon, children, className, ...props }: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground", className)}
      {...props}
    >
      {icon}
      {children}
    </Link>
  )
}

export function SidebarInset({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1", className)}>{children}</div>
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
