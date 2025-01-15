"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSessions, useDeleteSession } from "@/hooks/use-sessions"
import { SessionFormDialog } from "@/components/sessions/session-form-dialog"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/toast"
import { Session } from "@/services/sessions/types"
import { format } from "date-fns"

export default function SessionsPage() {
  const { data: sessions, isLoading } = useSessions()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const deleteSession = useDeleteSession()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      await deleteSession.mutateAsync(deleteId)
      toast({ title: "Success", description: "Session deleted successfully" })
      setDeleteId(null)
    } catch (error) {
      console.error(error)
      toast({ 
        title: "Error", 
        description: "Failed to delete session",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sessions</h1>
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Sessions</CardTitle>
            <SessionFormDialog mode="create" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Track</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Start Time</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">End Time</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Difficulty</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions?.items.map((session: Session) => (
                    <tr key={session.id} className="border-b">
                      <td className="p-4">{session.title}</td>
                      <td className="p-4">{session.track?.name || '-'}</td>
                      <td className="p-4">
                        <span className="capitalize">{session.sessionType.toLowerCase()}</span>
                      </td>
                      <td className="p-4">
                        {format(new Date(session.startTime), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="p-4">
                        {format(new Date(session.endTime), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{session.difficultyLevel.toLowerCase()}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <SessionFormDialog mode="edit" session={session} />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(session.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Session"
        description="Are you sure you want to delete this session? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteSession.isPending}
      />
    </div>
  )
} 