"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocations, useDeleteLocation } from "@/hooks/use-locations"
import { LocationFormDialog } from "@/components/locations/location-form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Eye } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Location } from "@/services/locations/types"
import { TableSkeleton } from "@/components/table-skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function LocationsPage() {
  const { data: locations, isLoading } = useLocations()
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [previewLocation, setPreviewLocation] = useState<Location | null>(null)
  const deleteLocation = useDeleteLocation()
  const { toast } = useToast()
  const [selectedFloorPlan, setSelectedFloorPlan] = useState<File | null>(null)
  const [floorPlanPreview, setFloorPlanPreview] = useState<string | undefined>(undefined)

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      await deleteLocation.mutateAsync(deleteId)
      toast({ title: "Success", description: "Location deleted successfully" })
      setDeleteId(null)
    } catch (error) {
      console.error(error)
      toast({ 
        title: "Error", 
        description: "Failed to delete location",
        variant: "destructive"
      })
    }
  }

  const handleFloorPlanSelect = (file: File | null) => {
    setSelectedFloorPlan(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFloorPlanPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFloorPlanPreview(undefined)
    }
  }

  useEffect(() => {
    if (locations?.find((location: Location) => location.id === deleteId)) {
      setDeleteId(null)
    }
  }, [locations, deleteId])

  return (
    <div className="p-6">
      <Dialog open={!!previewLocation} onOpenChange={() => setPreviewLocation(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Floor Plan - {previewLocation?.name}</DialogTitle>
          </DialogHeader>
          {previewLocation?.floorPlan && (
            <div className="relative aspect-video">
              <Image
                src={previewLocation.floorPlan.url}
                alt={`${previewLocation.name} floor plan`}
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Locations</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Locations</CardTitle>
          <LocationFormDialog 
            mode="create"
            selectedFloorPlan={selectedFloorPlan}
            floorPlanPreview={floorPlanPreview}
            onFloorPlanSelect={handleFloorPlanSelect}
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Capacity</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Floor</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Building</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={6} rows={10} />
                ) : (
                  locations?.map((location: Location) => (
                    <tr key={location.id} className="border-b">
                      <td className="p-4">{location.name}</td>
                      <td className="p-4">{location.description}</td>
                      <td className="p-4">{location.capacity}</td>
                      <td className="p-4">{location.floor}</td>
                      <td className="p-4">{location.building}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!location.floorPlan}
                            onClick={() => setPreviewLocation(location)}
                          >
                            <Eye className={cn(
                              "h-4 w-4",
                              !location.floorPlan && "text-muted-foreground"
                            )} />
                          </Button>
                          <LocationFormDialog 
                            mode="edit" 
                            location={location}
                            selectedFloorPlan={selectedFloorPlan}
                            floorPlanPreview={floorPlanPreview}
                            onFloorPlanSelect={handleFloorPlanSelect}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(location.id)}
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
        title="Delete Location"
        description="Are you sure you want to delete this location? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteLocation.isPending}
      />
    </div>
  )
} 