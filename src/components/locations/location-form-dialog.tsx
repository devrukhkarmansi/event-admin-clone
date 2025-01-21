"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCreateLocation, useUpdateLocation } from "@/hooks/use-locations"
import { Location, CreateLocationParams } from "@/services/locations/types"
import { FileUpload } from "@/components/ui/file-upload"
import { useUploadMedia } from "@/hooks/use-media"
import { MediaType } from "@/services/media/types"

export interface LocationFormDialogProps {
  mode: "create" | "edit"
  location?: Location
  selectedFloorPlan: File | null
  floorPlanPreview?: string
  onFloorPlanSelect: (file: File | null) => void
}

export function LocationFormDialog({ mode, location, selectedFloorPlan, floorPlanPreview, onFloorPlanSelect }: LocationFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [shouldRemoveFloorPlan, setShouldRemoveFloorPlan] = useState(false)
  const [showExistingFloorPlan, setShowExistingFloorPlan] = useState(true)
  const [formData, setFormData] = useState<CreateLocationParams>({
    name: location?.name || "",
    description: location?.description || "",
    capacity: location?.capacity || 0,
    floor: location?.floor || "",
    building: location?.building || "",
  })

  const { toast } = useToast()
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()
  const uploadMedia = useUploadMedia()

  const handleFloorPlanChange = (file: File | null) => {
    onFloorPlanSelect(file)
    if (!file) {
      setShouldRemoveFloorPlan(true)
      setShowExistingFloorPlan(false)
    } else {
      setShouldRemoveFloorPlan(false)
      setShowExistingFloorPlan(false)
    }
  }

  useEffect(() => {
    if (open) {
      setShowExistingFloorPlan(true)
      setShouldRemoveFloorPlan(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (mode === "create") {
        const newLocation = await createLocation.mutateAsync(formData)
        if (selectedFloorPlan) {
          const media = await uploadMedia.mutateAsync({ 
            file: selectedFloorPlan, 
            mediaType: MediaType.LOCATION_FLOOR_PLAN 
          })
          await updateLocation.mutateAsync({ 
            id: newLocation.id, 
            floorPlanId: media.id
          })
        }
        toast({ title: "Success", description: "Location created successfully" })
      } else {
        await updateLocation.mutateAsync({ 
          id: location!.id, 
          ...formData,
          floorPlanId: shouldRemoveFloorPlan ? -1 : undefined
        })
        if (selectedFloorPlan) {
          const media = await uploadMedia.mutateAsync({ 
            file: selectedFloorPlan, 
            mediaType: MediaType.LOCATION_FLOOR_PLAN 
          })
          await updateLocation.mutateAsync({ 
            id: location!.id,
            floorPlanId: media.id
          })
        }
        toast({ title: "Success", description: "Location updated successfully" })
      }
      setOpen(false)
      setShouldRemoveFloorPlan(false)
      onFloorPlanSelect(null)
    } catch (error) {
      console.error(error)
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
            Add Location
          </>
        ) : (
          <Pencil className="h-4 w-4" />
        )}
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Location" : "Edit Location"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Location name"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Location description"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Capacity</label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                min={0}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Floor</label>
              <Input
                value={formData.floor}
                onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                placeholder="Floor number/name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Building</label>
              <Input
                value={formData.building}
                onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                placeholder="Building name"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Floor Plan</label>
            {!open ? null : (
              <>
                <FileUpload
                  accept="image/*"
                  onChange={handleFloorPlanChange}
                  value={floorPlanPreview || (mode === "edit" && showExistingFloorPlan ? location?.floorPlan?.url : undefined)}
                  className="mt-2"
                />
                {mode === "edit" && location?.floorPlan ? (
                  <p className="text-sm text-muted-foreground mt-1">
                    Upload new floor plan to replace the current one
                  </p>
                ) : null}
              </>
            )}
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
              disabled={createLocation.isPending || updateLocation.isPending}
            >
              {createLocation.isPending || updateLocation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 