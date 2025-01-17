"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUsers } from "@/hooks/use-users"
import { useSessions } from "@/hooks/use-sessions"
import { Users, Calendar, UserCheck } from "lucide-react"
import { useCheckInCount } from "@/hooks/use-check-ins"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { data: users } = useUsers()
  const { data: sessions } = useSessions({})
  const { data: checkIns } = useCheckInCount()
  const router = useRouter()

  return (
    <div className="p-8 space-y-8">

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card 
          className={cn(
            "cursor-pointer transition-colors hover:bg-muted/50",
            "transform hover:scale-[1.02] transition-transform"
          )}
          onClick={() => router.push('/dashboard/users')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.meta.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total registered users
            </p>
          </CardContent>
        </Card>
        
        <Card
          className={cn(
            "cursor-pointer transition-colors hover:bg-muted/50",
            "transform hover:scale-[1.02] transition-transform"
          )}
          onClick={() => router.push('/dashboard/check-ins')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Check-ins</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkIns?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unique attendees today
            </p>
          </CardContent>
        </Card>
        
        <Card
          className={cn(
            "cursor-pointer transition-colors hover:bg-muted/50",
            "transform hover:scale-[1.02] transition-transform"
          )}
          onClick={() => router.push('/dashboard/sessions')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions?.meta.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total scheduled sessions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 