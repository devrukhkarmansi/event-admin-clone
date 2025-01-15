"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil } from "lucide-react"
import { useToast } from "@/components/ui/toast"
import { useCreateLocation, useUpdateLocation } from "@/hooks/use-locations"
import { Location, CreateLocationParams } from "@/services/locations/types"

interface LocationFormDialogProps {
  mode: "create" | "edit"
  location?: Location
}

export function LocationFormDialog({ mode, location }: LocationFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CreateLocationParams>({
    name: location?.name || "",
    description: location?.description || "",
    capacity: location?.capacity || 0,
    floor: location?.floor || "",
    building: location?.building || ""
  })

  const { toast } = useToast()
  const createLocation = useCreateLocation()
  const updateLocation = useUpdateLocation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (mode === "create") {
        await createLocation.mutateAsync(formData)
        toast({ title: "Success", description: "Location created successfully" })
      } else {
        await updateLocation.mutateAsync({ id: location!.id, ...formData })
        toast({ title: "Success", description: "Location updated successfully" })
      }
      setOpen(false)
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