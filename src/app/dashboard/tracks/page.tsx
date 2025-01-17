"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTracks, useDeleteTrack } from "@/hooks/use-tracks"
import { TrackFormDialog } from "@/components/tracks/track-form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Track } from "@/services/tracks/types"
import { TableSkeleton } from "@/components/table-skeleton"

export default function TracksPage() {
  const { data: tracks, isLoading } = useTracks()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const deleteTrack = useDeleteTrack()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      await deleteTrack.mutateAsync(deleteId)
      toast({ title: "Success", description: "Track deleted successfully" })
      setDeleteId(null)
    } catch (error) {
      console.error(error)
      toast({ 
        title: "Error", 
        description: "Failed to delete track",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tracks</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Tracks</CardTitle>
          <TrackFormDialog mode="create" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={4} rows={10} />
                ) : (
                  tracks?.map((track: Track) => (
                    <tr key={track.id} className="border-b">
                      <td className="p-4">{track.name}</td>
                      <td className="p-4">{track.description}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <TrackFormDialog mode="edit" track={track} />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(track.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Track"
        description="Are you sure you want to delete this track? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteTrack.isPending}
      />
    </div>
  )
} 