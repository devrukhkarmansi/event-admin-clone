'use client'

import { useEvent, useSponsors, useDeleteSponsor } from '@/hooks/use-events'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Trash2, ImageIcon } from 'lucide-react'
import { SponsorType, Sponsor } from '@/services/events/types'
import { SponsorFormDialog } from "@/components/sponsors/sponsor-form-dialog"

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

export default function EventPage() {
  const { data: event, isLoading: eventLoading } = useEvent()
  const { data: sponsors, isLoading: sponsorsLoading } = useSponsors()
  const deleteSponsor = useDeleteSponsor()

  if (eventLoading || sponsorsLoading) return <div>Loading...</div>
  if (!event) return <div>Event not found</div>

  const handleDelete = async (id: string | number) => {
    if (confirm('Are you sure you want to delete this sponsor?')) {
      try {
        await deleteSponsor.mutateAsync(id)
      } catch (error) {
        console.error('Failed to delete sponsor:', error)
      }
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
            <CardTitle>Event Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={event.name}
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={event.description}
                  disabled
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <div className="grid gap-4">
                  <Input
                    placeholder="Street"
                    value={event.address.street}
                    disabled
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="City"
                      value={event.address.city}
                      disabled
                    />
                    <Input
                      placeholder="State"
                      value={event.address.state}
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Country"
                      value={event.address.country}
                      disabled
                    />
                    <Input
                      placeholder="Postal Code"
                      value={event.address.postalCode}
                      disabled
                    />
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
                            onClick={() => handleDelete(sponsor.id)}
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
    </div>
  )
} 