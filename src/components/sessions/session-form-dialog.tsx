"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { useCreateSession, useUpdateSession } from "@/hooks/use-sessions"
import { Session, SessionType, DifficultyLevel, CreateSessionParams } from "@/services/sessions/types"
import { useTracks } from "@/hooks/use-tracks"
import { Textarea } from "@/components/ui/textarea"
import { useUsers } from "@/hooks/use-users"
import { useLocations } from "@/hooks/use-locations"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SessionFormDialogProps {
  mode: "create" | "edit"
  session?: Session
}

export function SessionFormDialog({ mode, session }: SessionFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateSessionParams>({
    title: session?.title || "",
    description: session?.description || "",
    sessionType: session?.sessionType || SessionType.TALK,
    startTime: session?.startTime || "",
    endTime: session?.endTime || "",
    locationId: session?.locationId || 1,
    capacity: session?.capacity || 50,
    difficultyLevel: session?.difficultyLevel || DifficultyLevel.BEGINNER,
    speakerId: session?.speakerId || "",
    trackId: session?.trackId
  })

  const { toast } = useToast()
  const { data: tracks } = useTracks()
  const createSession = useCreateSession()
  const updateSession = useUpdateSession()
  const { data: users } = useUsers()
  const { data: locations } = useLocations()

  const sessionTypes = [
    { value: "workshop", label: "Workshop" },
    { value: "talk", label: "Talk" },
    { value: "panel", label: "Panel" }
  ]

  const difficultyLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ]

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "cancelled", label: "Cancelled" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (mode === "create") {
        await createSession.mutateAsync(formData)
        toast({ title: "Success", description: "Session created successfully" })
      } else {
        await updateSession.mutateAsync({ id: session!.id, ...formData })
        toast({ title: "Success", description: "Session updated successfully" })
      }
      setOpen(false)
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      })
    }
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
            Add Session
          </>
        ) : (
          <Pencil className="h-4 w-4" />
        )}
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Session" : "Edit Session"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Session title"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Track</label>
              <Select
                value={formData.trackId?.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, trackId: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent>
                  {tracks?.map(track => (
                    <SelectItem key={track.id} value={track.id.toString()}>
                      {track.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Session description"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Session Type</label>
              <Select
                value={formData.sessionType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sessionType: value as SessionType }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select
                value={formData.difficultyLevel}
                onValueChange={(value) => setFormData(prev => ({ ...prev, difficultyLevel: value as DifficultyLevel }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Time</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startTime ? format(new Date(formData.startTime), "PPP HH:mm") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startTime ? new Date(formData.startTime) : undefined}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, startTime: date.toISOString() }))}
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={formData.startTime ? format(new Date(formData.startTime), "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":")
                        const date = formData.startTime ? new Date(formData.startTime) : new Date()
                        date.setHours(parseInt(hours), parseInt(minutes))
                        setFormData(prev => ({ ...prev, startTime: date.toISOString() }))
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium">End Time</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endTime ? format(new Date(formData.endTime), "PPP HH:mm") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endTime ? new Date(formData.endTime) : undefined}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, endTime: date.toISOString() }))}
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={formData.endTime ? format(new Date(formData.endTime), "HH:mm") : ""}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":")
                        const date = formData.endTime ? new Date(formData.endTime) : new Date()
                        date.setHours(parseInt(hours), parseInt(minutes))
                        setFormData(prev => ({ ...prev, endTime: date.toISOString() }))
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Speaker</label>
              <Select
                value={formData.speakerId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, speakerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Select
                value={formData.locationId?.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, locationId: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations?.map(location => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Capacity</label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                min={1}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Banner Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  // Handle file upload
                }
              }}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createSession.isPending || updateSession.isPending}
            >
              {createSession.isPending || updateSession.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 