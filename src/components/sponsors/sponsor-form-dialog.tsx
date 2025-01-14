"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Plus } from "lucide-react"
import { useCreateSponsor, useUpdateSponsor } from "@/hooks/use-events"
import { Sponsor, SponsorType } from "@/services/events/types"
import { useUploadMedia } from "@/hooks/use-media"
import { MediaType } from "@/services/media/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FileUpload } from "@/components/ui/file-upload"
import { Label } from "@radix-ui/react-label"

interface SponsorFormDialogProps {
  sponsor?: Sponsor  // Optional for create mode
  mode: 'create' | 'edit'
}

export function SponsorFormDialog({ sponsor, mode }: SponsorFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [logo, setLogo] = useState<{ file?: File; url?: string }>({
    url: sponsor?.logo?.url
  })
  const createSponsor = useCreateSponsor()
  const updateSponsor = useUpdateSponsor()
  const uploadMedia = useUploadMedia()

  useEffect(() => {
    if (!open) {
      setLogo({ url: sponsor?.logo?.url })
    }
  }, [open, sponsor?.logo?.url])

  const loading = createSponsor.isPending || updateSponsor.isPending
  const uploadingLogo = uploadMedia.isPending

  const handleLogoChange = (file: File | null) => {
    if (file) {
      setLogo({ file, url: URL.createObjectURL(file) })
    } else {
      setLogo({})
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      let logoId: number | undefined = sponsor?.logoId || undefined

      if (logo.file) {
        const mediaResponse = await uploadMedia.mutateAsync({
          file: logo.file,
          mediaType: MediaType.SPONSOR_LOGO
        })
        logoId = mediaResponse.id
      }
      
      if (!logo.url && !logo.file) {
        logoId = undefined
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
          <div className="space-y-2">
            <Label>Logo</Label>
            <FileUpload
              accept="image/*"
              onChange={handleLogoChange}
              loading={uploadingLogo}
              disabled={loading}
              value={logo?.url}
            />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input 
              name="name" 
              defaultValue={sponsor?.name}
              required 
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select name="type" defaultValue={sponsor?.sponsorType} required>
              <SelectTrigger>
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
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              name="description" 
              defaultValue={sponsor?.description}
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