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
            "cursor-pointer transition-colors",
            "transform hover:scale-[1.02] transition-transform",
            "relative overflow-hidden"
          )}
          onClick={() => router.push('/dashboard/users')}
        >
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-primary/10 to-transparent" />
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-8 w-8 text-primary" />
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
            "cursor-pointer transition-colors",
            "transform hover:scale-[1.02] transition-transform",
            "relative overflow-hidden"
          )}
          onClick={() => router.push('/dashboard/check-ins')}
        >
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-500/10 to-transparent" />
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Check-ins</CardTitle>
            <UserCheck className="h-8 w-8 text-green-500" />
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
            "cursor-pointer transition-colors",
            "transform hover:scale-[1.02] transition-transform",
            "relative overflow-hidden"
          )}
          onClick={() => router.push('/dashboard/sessions')}
        >
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-500/10 to-transparent" />
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Calendar className="h-8 w-8 text-blue-500" />
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