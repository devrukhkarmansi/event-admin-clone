"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSessions, useDeleteSession, useSession, useUpdateSession, useCreateSession } from "@/hooks/use-sessions"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Eye, ArrowLeft, Pencil, CalendarIcon, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/components/ui/toast"
import { CreateSessionParams, DifficultyLevel, Session, SessionType } from "@/services/sessions/types"
import { format } from "date-fns"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useTracks } from "@/hooks/use-tracks"
import { useUsers } from "@/hooks/use-users"
import { useLocations } from "@/hooks/use-locations"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { FileUpload } from "@/components/ui/file-upload"
import { useUploadMedia } from "@/hooks/use-media"
import { MediaType } from "@/services/media/types"

export default function SessionsPage() {
  const sessionTypes = [
    { value: SessionType.WORKSHOP, label: "Workshop" },
    { value: SessionType.TALK, label: "Talk" },
    { value: SessionType.PANEL, label: "Panel" }
  ]

  const difficultyLevels = [
    { value: DifficultyLevel.BEGINNER, label: "Beginner" },
    { value: DifficultyLevel.INTERMEDIATE, label: "Intermediate" },
    { value: DifficultyLevel.ADVANCED, label: "Advanced" }
  ]

  const [viewId, setViewId] = useState<number | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { data: sessions, isLoading } = useSessions()
  const { data: currentSession, refetch } = useSession(viewId || 0)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const deleteSession = useDeleteSession()
  const updateSession = useUpdateSession()
  const createSession = useCreateSession()
  const { toast } = useToast()
  const { data: tracks } = useTracks()
  const { data: users } = useUsers()
  const { data: locations } = useLocations()
  const uploadMedia = useUploadMedia()
  const [selectedBanner, setSelectedBanner] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string | undefined>(undefined)

  const emptySession = useMemo(() => ({
    title: "",
    description: "",
    sessionType: SessionType.TALK,
    startTime: "",
    endTime: "",
    locationId: 0,
    capacity: 50,
    difficultyLevel: DifficultyLevel.BEGINNER,
    speakerId: "",
    trackId: undefined
  }), [])

  const [formData, setFormData] = useState<CreateSessionParams>(emptySession)

  useEffect(() => {
    if (currentSession && !isAdding) {
      setFormData({
        title: currentSession.title,
        description: currentSession.description,
        sessionType: currentSession.sessionType,
        startTime: currentSession.startTime,
        endTime: currentSession.endTime,
        locationId: currentSession.locationId,
        capacity: currentSession.capacity,
        difficultyLevel: currentSession.difficultyLevel,
        speakerId: currentSession.speaker?.id || "",
        trackId: currentSession.tracks?.[0]?.id,
        status: currentSession.status
      })
      if (currentSession.banner?.url) {
        setBannerPreview(currentSession.banner.url)
      }
    } else if (isAdding) {
      setFormData(emptySession)
      setBannerPreview(undefined)
    }
  }, [currentSession, isAdding, emptySession])

  const handleBannerSelect = (file: File | null) => {
    setSelectedBanner(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setBannerPreview(undefined)
    }
  }

  const handleSubmit = async () => {
    try {
      if (isAdding) {
        const newSession = await createSession.mutateAsync(formData)
        
        if (selectedBanner) {
          const media = await uploadMedia.mutateAsync({ 
            file: selectedBanner, 
            mediaType: MediaType.SESSION_BANNER 
          })
          await updateSession.mutateAsync({ 
            id: newSession.id,
            bannerId: media.id
          })
        }
        
        toast({ title: "Success", description: "Session created successfully" })
        setIsAdding(false)
        setViewId(null)
      } else {
        await updateSession.mutateAsync({ 
          id: currentSession!.id, 
          ...formData
        })
        
        if (selectedBanner) {
          const media = await uploadMedia.mutateAsync({ 
            file: selectedBanner, 
            mediaType: MediaType.SESSION_BANNER 
          })
          await updateSession.mutateAsync({ 
            id: currentSession!.id,
            bannerId: media.id
          })
        }
        
        setIsEditing(false)
        await refetch()
        toast({ title: "Success", description: "Session updated successfully" })
      }
      setSelectedBanner(null)
      setBannerPreview(undefined)
    } catch (error) {
      console.error(error)
      toast({ 
        title: "Error", 
        description: "Failed to save session",
        variant: "destructive"
      })
    }
  }

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

  if (viewId && currentSession || isAdding) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                if (isEditing || isAdding) {
                  if (confirm("Discard changes?")) {
                    setIsEditing(false)
                    setIsAdding(false)
                    setViewId(null)
                  }
                } else {
                  setViewId(null)
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isAdding ? "Add Session" : currentSession?.title}
            </h1>
          </div>
          {(isEditing || isAdding) ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  if (isAdding) {
                    setIsAdding(false)
                    setFormData(emptySession)
                    setViewId(null)
                  } else {
                    setIsEditing(false)
                    setFormData({
                      title: currentSession!.title,
                      description: currentSession!.description,
                      sessionType: currentSession!.sessionType,
                      startTime: currentSession!.startTime,
                      endTime: currentSession!.endTime,
                      locationId: currentSession!.locationId,
                      capacity: currentSession!.capacity,
                      difficultyLevel: currentSession!.difficultyLevel,
                      speakerId: currentSession!.speaker?.id || "",
                      trackId: currentSession!.trackId
                    })
                    setViewId(null)
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={updateSession.isPending || createSession.isPending}
              >
                {(updateSession.isPending || createSession.isPending) ? "Saving..." : "Save"}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              Edit Session
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  disabled={!isEditing && !isAdding}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Track</label>
                <Select
                  value={formData.trackId?.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trackId: Number(value) }))}
                  disabled={!isEditing && !isAdding}
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
              <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} disabled={!isEditing && !isAdding} className="mt-2" />
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium">Session Type</label>
                <Select
                  value={formData.sessionType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sessionType: value as SessionType }))}
                  disabled={!isEditing && !isAdding}
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
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    difficultyLevel: value as DifficultyLevel 
                  }))}
                  disabled={!isEditing && !isAdding}
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
              <div>
                <label className="text-sm font-medium">Capacity</label>
                <Input 
                  value={formData.capacity} 
                  type="number" 
                  disabled={!isEditing && !isAdding}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    capacity: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
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
                      disabled={!isEditing && !isAdding}
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
                      disabled={!isEditing && !isAdding}
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

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Speaker</label>
                <Select
                  value={formData.speakerId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, speakerId: value }))}
                  disabled={!isEditing && !isAdding}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select speaker" />
                  </SelectTrigger>
                  <SelectContent>
                    {users?.items.map(user => (
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
                  disabled={!isEditing && !isAdding}
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

            <div>
              <label className="text-sm font-medium">Banner Image</label>
              {(isEditing || isAdding) ? (
                <FileUpload
                  accept="image/*"
                  onChange={handleBannerSelect}
                  value={bannerPreview}
                  className="mt-2"
                />
              ) : currentSession?.banner ? (
                <Image 
                  src={currentSession.banner.url} 
                  alt={currentSession.title}
                  width={800}
                  height={400}
                  className="rounded-lg max-h-[200px] object-cover"
                />
              ) : (
                <p className="text-muted-foreground">No banner image</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Session
        </Button>
      </div>

      {isLoading ? (
        <LoadingScreen />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Sessions</CardTitle>
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
                    <th className="h-12 px-4 text-left align-middle font-medium">Difficulty</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions?.items.map((session: Session) => (
                    <tr key={session.id} className="border-b">
                      <td className="p-4">{session.title}</td>
                      <td className="p-4">{session.tracks?.[0]?.name || '-'}</td>
                      <td className="p-4">
                        <span className="capitalize">{session.sessionType.toLowerCase()}</span>
                      </td>
                      <td className="p-4">
                        {format(new Date(session.startTime), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{session.difficultyLevel.toLowerCase()}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewId(session.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setViewId(session.id)
                              setIsEditing(true)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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