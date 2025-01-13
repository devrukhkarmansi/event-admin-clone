"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Pencil, Plus } from "lucide-react"
import { useCreateSponsor, useUpdateSponsor } from "@/hooks/use-events"
import { Sponsor, SponsorType } from "@/services/events/types"
import Image from "next/image"
import { useUploadMedia } from "@/hooks/use-media"
import { MediaType } from "@/services/media/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface SponsorFormDialogProps {
  sponsor?: Sponsor  // Optional for create mode
  mode: 'create' | 'edit'
}

export function SponsorFormDialog({ sponsor, mode }: SponsorFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>()
  const createSponsor = useCreateSponsor()
  const updateSponsor = useUpdateSponsor()
  const uploadMedia = useUploadMedia()
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      let logoId = sponsor?.logoId || undefined
      const logoFile = formData.get('logo') as File

      if (logoFile?.size) {
        const mediaResponse = await uploadMedia.mutateAsync({
          file: logoFile,
          mediaType: MediaType.SPONSOR_LOGO
        })
        logoId = mediaResponse.id
      }
      
      const sponsorData = {
        name: formData.get('name') as string,
        type: formData.get('type') as SponsorType,
        description: formData.get('description') as string,
        logoId
      }

      if (mode === 'edit' && sponsor) {
        await updateSponsor.mutateAsync({
          id: sponsor.id,
          ...sponsorData
        })
      } else {
        await createSponsor.mutateAsync(sponsorData)
      }

      setOpen(false)
      setPreviewUrl(undefined)
    } catch (error) {
      console.error(`Failed to ${mode} sponsor:`, error)
    }
  }

  const isSubmitting = createSponsor.isPending || updateSponsor.isPending || uploadMedia.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === 'edit' ? (
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Sponsor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit' : 'Add'} Sponsor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Logo</label>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center">
                {previewUrl ? (
                  <Image 
                    src={previewUrl}
                    alt="Logo preview"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : sponsor?.logo?.url ? (
                  <Image 
                    src={sponsor.logo.url}
                    alt={sponsor.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <Input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleLogoChange}
                className="flex-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input 
              name="name" 
              defaultValue={sponsor?.name}
              required 
              className="mt-1.5" 
            />
          </div>
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select name="type" defaultValue={sponsor?.sponsorType} required>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select sponsor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SponsorType.PLATINUM}>Platinum</SelectItem>
                <SelectItem value={SponsorType.GOLD}>Gold</SelectItem>
                <SelectItem value={SponsorType.SILVER}>Silver</SelectItem>
                <SelectItem value={SponsorType.BRONZE}>Bronze</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              name="description" 
              defaultValue={sponsor?.description}
              className="mt-1.5" 
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {mode === 'edit' ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              mode === 'edit' ? 'Update' : 'Add'
            )} Sponsor
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 