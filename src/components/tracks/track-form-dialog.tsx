"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { useCreateTrack, useUpdateTrack } from "@/hooks/use-tracks"
import { Track } from "@/services/tracks/types"

interface TrackFormDialogProps {
  mode: "create" | "edit"
  track?: Track
}

export function TrackFormDialog({ mode, track }: TrackFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(track?.name || "")
  const [description, setDescription] = useState(track?.description || "")
  const { toast } = useToast()
  
  const createTrack = useCreateTrack()
  const updateTrack = useUpdateTrack()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (mode === "create") {
        await createTrack.mutateAsync({ name, description })
        toast({ title: "Success", description: "Track created successfully" })
      } else {
        await updateTrack.mutateAsync({ id: track!.id, name, description })
        toast({ title: "Success", description: "Track updated successfully" })
      }
      setOpen(false)
      resetForm()
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant={mode === "create" ? "default" : "ghost"}
        size={mode === "create" ? "sm" : "icon"}
        onClick={() => setOpen(true)}
      >
        {mode === "create" ? (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add Track
          </>
        ) : (
          <Pencil className="h-4 w-4" />
        )}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Track" : "Edit Track"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Track name"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Track description"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createTrack.isPending || updateTrack.isPending}
            >
              {createTrack.isPending || updateTrack.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 