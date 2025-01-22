"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSponsors, useDeleteSponsor } from "@/hooks/use-sponsors"
import { SponsorFormDialog } from "@/components/sponsors/sponsor-form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { useToast, type ToastFunction } from "@/hooks/use-toast"
import { Sponsor, SponsorType } from "@/services/events/types"
import { TableSkeleton } from "@/components/table-skeleton"
import Image from "next/image"

const formatSponsorType = (type: SponsorType) => {
  if (!type) return '';
  return type.toString().split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}

const sponsorTypeStyles = {
    [SponsorType.PLATINUM]: 'bg-violet-100 text-violet-800',
    [SponsorType.GOLD]: 'bg-yellow-100 text-yellow-800',
    [SponsorType.SILVER]: 'bg-gray-100 text-gray-800',
    [SponsorType.BRONZE]: 'bg-orange-100 text-orange-800',
  }
  
const showToast = (toast: ToastFunction, { title, description, type = "success" }: { 
  title: string, 
  description: string, 
  type?: "success" | "error" 
}) => {
  toast({
    title,
    description,
    variant: type === "error" ? "destructive" : "default",
    duration: 3000,
  })
}

export default function SponsorsPage() {
  const { data: sponsors, isLoading } = useSponsors()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteSponsor = useDeleteSponsor()
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      await deleteSponsor.mutateAsync(deleteId)
      showToast(toast, {
        title: "Success",
        description: "Sponsor deleted successfully"
      })
      setDeleteId(null)
    } catch (error) {
      console.error('Delete sponsor error:', error)
      showToast(toast, {
        title: "Error",
        description: "Failed to delete sponsor",
        type: "error"
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sponsors</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Sponsors</CardTitle>
          <SponsorFormDialog 
            mode="create"
          />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium w-[50px]"></th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <TableSkeleton columns={5} rows={10} />
                ) : (
                  sponsors?.map((sponsor: Sponsor) => (
                    <tr key={sponsor.id} className="border-b">
                      <td className="p-4">
                        {sponsor.logo && (
                          <div className="relative h-8 w-8">
                            <Image
                              src={sponsor.logo.url}
                              alt={sponsor.name}
                              fill
                              className="rounded object-contain"
                            />
                          </div>
                        )}
                      </td>
                      <td className="p-4">{sponsor.name}</td>
                      <td className="p-4">{sponsor.description}</td>
                      <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${sponsorTypeStyles[sponsor.sponsorType]}`}>
                          {formatSponsorType(sponsor.sponsorType)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <SponsorFormDialog 
                            mode="edit" 
                            sponsor={sponsor}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(sponsor.id.toString())}
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
        title="Delete Sponsor"
        description="Are you sure you want to delete this sponsor? This action cannot be undone."
        onConfirm={handleDelete}
        loading={deleteSponsor.isPending}
      />
    </div>
  )
} 