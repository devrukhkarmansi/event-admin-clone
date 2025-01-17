"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUsers } from "@/hooks/use-users"
import { useSessions } from "@/hooks/use-sessions"
import { Users, Calendar, UserCheck } from "lucide-react"
import { useCheckInCount } from "@/hooks/use-check-ins"

export default function DashboardPage() {
  const { data: users } = useUsers()
  const { data: sessions } = useSessions({})
  const { data: checkIns } = useCheckInCount()

  return (
    <div className="p-8 space-y-8">
    console.log(checkIns)

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.meta.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
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
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions?.meta.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">
              +4.2% from last week
            </p>
          </CardContent>
        </Card>
        
        {/* ... similar cards for tracks and locations ... */}
      </div>
    </div>
  )
} 