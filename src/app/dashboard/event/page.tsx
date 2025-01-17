'use client'

import { useEvent, useSponsors, useDeleteSponsor } from '@/hooks/use-events'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2, ImageIcon, Pencil, Save, X } from 'lucide-react'
import { SponsorType, Sponsor } from '@/services/events/types'
import { SponsorFormDialog } from "@/components/sponsors/sponsor-form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useState, useEffect } from 'react'
import { LoadingScreen } from "@/components/ui/loading-screen"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { eventsService, UpdateEventParams } from "@/services/events/events.service"
import { useToast } from "@/hooks/use-toast"
import { useUploadMedia } from "@/hooks/use-media"
import { MediaType } from "@/services/media/types"
import { FileUpload } from "@/components/ui/file-upload"
import { MarkdownContent } from "@/components/markdown-content"

const sponsorTypeStyles = {
  [SponsorType.PLATINUM]: 'bg-violet-100 text-violet-800',
  [SponsorType.GOLD]: 'bg-yellow-100 text-yellow-800',
  [SponsorType.SILVER]: 'bg-gray-100 text-gray-800',
  [SponsorType.BRONZE]: 'bg-orange-100 text-orange-800',
}

const formatSponsorType = (type: SponsorType) => {
  if (!type) return '';
  return type.toString().split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

interface FormData {
  name: string
  description: string
  logo?: { id: number; url: string }
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    country: string
    postalCode: string
  }
}

export default function EventPage() {
  const [isEditing, setIsEditing] = useState(false)
  const { data: event, isLoading: eventLoading } = useEvent()
  const { data: sponsors, isLoading: sponsorsLoading } = useSponsors()
  const [deleteId, setDeleteId] = useState<string | number | null>(null)
  const deleteSponsor = useDeleteSponsor()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    logo: undefined,
    address: {
      line1: "",
      line2: "",
      city: "",
      state: "",
      country: "",
      postalCode: ""
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateEventParams) => eventsService.updateEvent(data),
    onSuccess: () => {
      toast({ title: "Success", description: "Event updated successfully" })
      queryClient.invalidateQueries({ queryKey: ['event'] })
      setIsEditing(false)
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update event",
        variant: "destructive"
      })
    }
  })

  const uploadLogo = useUploadMedia()

  const handleLogoChange = async (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, logo: undefined }))
      return
    }

    try {
      setUploadingLogo(true)
      const { id, url } = await uploadLogo.mutateAsync({
        file,
        mediaType: MediaType.EVENT_LOGO
      })
      setFormData(prev => ({
        ...prev,
        logo: { id, url }
      }))
    } catch (error) {
      console.error('Failed to upload logo:', error)
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive"
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        description: event.description || "",
        logo: event.logo,
        address: {
          line1: event.address.line1 || "",
          line2: event.address.line2 || "",
          city: event.address.city || "",
          state: event.address.state || "",
          country: event.address.country || "",
          postalCode: event.address.postalCode || ""
        }
      })
    }
  }, [event])

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: event!.name,
      description: event!.description,
      logo: event!.logo,
      address: {
        line1: event!.address.line1,
        line2: event!.address.line2,
        city: event!.address.city,
        state: event!.address.state,
        country: event!.address.country,
        postalCode: event!.address.postalCode
      }
    })
  }

  if (eventLoading || sponsorsLoading) {
    return <LoadingScreen />
  }

  if (!event) return <div>Event not found</div>

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      await deleteSponsor.mutateAsync(deleteId)
      setDeleteId(null)
    } catch (error) {
      console.error('Failed to delete sponsor:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event Details</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Event Information</CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Event
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCancel}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => updateMutation.mutate({ 
                      ...formData,
                      id: event.id,
                    })}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {isEditing && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Logo</label>
                  <FileUpload
                    accept="image/*"
                    onChange={handleLogoChange}
                    loading={uploadingLogo}
                    disabled={updateMutation.isPending}
                    value={formData.logo?.url}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={isEditing ? formData.name : event.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                {isEditing ? (
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Event description (supports markdown)"
                    className="mt-2"
                    rows={6}
                  />
                ) : (
                  <div className="mt-2">
                    {event?.description ? (
                      <MarkdownContent content={event.description} />
                    ) : (
                      <p className="text-muted-foreground">No description</p>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <div className="grid gap-4 mt-2">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Street Address</label>
                    <Input
                      placeholder="Address Line 1"
                      value={isEditing ? formData.address.line1 : event.address.line1}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, line1: e.target.value }
                      })}
                      disabled={!isEditing}
                    />
                    <Input
                      placeholder="Address Line 2 (Optional)"
                      value={isEditing ? formData.address.line2 : event.address.line2}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        address: { ...formData.address, line2: e.target.value }
                      })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">City</label>
                      <Input
                        placeholder="City"
                        value={isEditing ? formData.address.city : event.address.city}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, city: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">State</label>
                      <Input
                        placeholder="State"
                        value={isEditing ? formData.address.state : event.address.state}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, state: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Country</label>
                      <Input
                        placeholder="Country"
                        value={isEditing ? formData.address.country : event.address.country}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, country: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Postal Code</label>
                      <Input
                        placeholder="Postal Code"
                        value={isEditing ? formData.address.postalCode : event.address.postalCode}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          address: { ...formData.address, postalCode: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Sponsors</CardTitle>
            <SponsorFormDialog mode="create" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Logo</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                    <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sponsors?.map((sponsor: Sponsor) => (
                    <tr key={sponsor.id} className="border-b">
                      <td className="p-4">
                        {sponsor.logo?.url ? (
                          <Image
                            src={sponsor.logo.url}
                            alt={sponsor.name}
                            width={40}
                            height={40}
                            className="rounded object-contain"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle">{sponsor.name}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sponsorTypeStyles[sponsor.sponsorType]}`}>
                          {formatSponsorType(sponsor.sponsorType)}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {sponsor.description}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <SponsorFormDialog mode="edit" sponsor={sponsor} />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setDeleteId(sponsor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Sponsor"
        description="Are you sure you want to delete this sponsor? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteSponsor.isPending}
      />
    </div>
  )
} 