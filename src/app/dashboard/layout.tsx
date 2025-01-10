import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { FloatingThemeToggle } from "@/components/floating-theme-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <FloatingThemeToggle />
      <div className="flex min-h-screen">
        <div className="w-64 border-r">
          <AppSidebar />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
} 