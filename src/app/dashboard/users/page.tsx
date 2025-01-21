"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Search, ArrowUpDown, Eye, ArrowLeft } from "lucide-react"
import { useUsers, useUser } from "@/hooks/use-users"
import { User } from "@/services/users/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UserAvatar } from "@/components/user-avatar"
import { useState, useRef } from "react"
import Image from "next/image"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersService } from "@/services/users/users.service"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/ui/pagination"
import { TableSkeleton } from "@/components/table-skeleton"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const limit = 10
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    sortBy: "createdAt",
    sortOrder: "DESC" as "ASC" | "DESC"
  })
  const { data: users, isLoading } = useUsers({
    page,
    limit,
    ...filters,
    role: filters.role === "all" ? undefined : filters.role,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)
  const [viewId, setViewId] = useState<string | null>(null)
  const { data: currentUser } = useUser(viewId || "")
  
  const importMutation = useMutation({
    mutationFn: (file: File) => usersService.importUsers(file),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Users imported successfully",
      })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to import users",
        variant: "destructive",
      })
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      importMutation.mutate(file, {
        onSettled: () => {
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        }
      })
    }
  }

  if (viewId && currentUser) {
    return (
      <div className="space-y-4 p-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setViewId(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="relative w-full rounded-lg">
                  <div className="relative w-full h-64 bg-muted">
                    <Image
                      src={currentUser.profileBanner?.url || '/images/default-banner.png'}
                      alt="Profile"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                    <div className="relative w-24 h-24 rounded-full border-4 border-background overflow-hidden">
                      {currentUser.profileImage ? (
                        <Image
                          src={currentUser.profileImage.url}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-2xl font-semibold">
                            {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-20">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">First Name</label>
                      <Input value={currentUser.firstName || ''} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name</label>
                      <Input value={currentUser.lastName || ''} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input value={currentUser.email} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input value={currentUser.phoneNumber || ''} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Designation</label>
                      <Input value={currentUser.designation || ''} disabled />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <Input value={currentUser.role?.name || ''} disabled className="capitalize" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Bio</label>
                      <Textarea value={currentUser.bio || ''} disabled className="resize-none" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {currentUser.company && (
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 mb-8">
                    {currentUser.company.logo && (
                      <Image
                        src={currentUser.company.logo.url}
                        alt={currentUser.company.name}
                        width={64}
                        height={64}
                        className="rounded-lg object-contain"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium">{currentUser.company.name}</h3>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {currentUser.company.description && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                          value={currentUser.company.description} 
                          disabled 
                          className="resize-none mt-2 h-24"
                        />
                      </div>
                    )}
                    {currentUser.company.website && (
                      <div>
                        <label className="text-sm font-medium">Website</label>
                        <div className="mt-2 relative">
                          <Input 
                            value={currentUser.company.website} 
                            disabled 
                            className="text-muted-foreground"
                          />
                          <a 
                            href={currentUser.company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 flex items-center px-3 text-primary hover:underline cursor-pointer"
                          >
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentUser.role?.name === 'speaker' && currentUser.speakerSessions && (
            <Card>
              <CardHeader>
                <CardTitle>Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentUser.speakerSessions.map(session => (
                    <div key={session.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(session.startTime), "PPP")} • {session.location.name}
                        </p>
                      </div>
                      <Badge>{session.sessionType}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
        />
        <Button 
          onClick={() => fileInputRef.current?.click()}
          disabled={importMutation.isPending}
        >
          <Upload className="mr-2 h-4 w-4" />
          {importMutation.isPending ? "Importing..." : "Import Users"}
        </Button>
      </div>

      <Card>
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CardHeader className="cursor-pointer hover:bg-muted/50">
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <CardTitle>Filters</CardTitle>
              <ChevronDown className={cn("h-4 w-4 transition-transform", {
                "-rotate-180": isFiltersOpen
              })} />
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      search: "",
                      role: "all",
                      sortBy: "createdAt",
                      sortOrder: "DESC"
                    })}
                  >
                    Clear Filters
                  </Button>
                </div>
                <div className="flex gap-4">
                  <Select
                    value={filters.role}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="speaker">Speaker</SelectItem>
                      <SelectItem value="attendee">Attendee</SelectItem>
                      <SelectItem value="delegate">Delegate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by">
                        <div className="flex items-center gap-2">
                          <span>
                            {filters.sortBy === "name" ? "Sort by Name" :
                             filters.sortBy === "role" ? "Sort by Role" :
                             filters.sortBy === "createdAt" ? "Sort by Created Date" :
                             "Sort by"}
                          </span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Sort by Name</SelectItem>
                      <SelectItem value="role">Sort by Role</SelectItem>
                      <SelectItem value="createdAt">Sort by Created Date</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sortOrder: prev.sortOrder === "DESC" ? "ASC" : "DESC" 
                    }))}
                    className="flex items-center gap-2"
                  >
                    {filters.sortOrder === "DESC" ? "Newest First" : "Oldest First"}
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users</CardTitle>
            <div className="text-sm text-muted-foreground">
              Total: {users?.meta?.totalItems || 0} users
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : !users?.items ? (
            <div>No users found</div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Name</TableHead>
                    <TableHead className="w-[250px]">Email</TableHead>
                    <TableHead className="w-[150px]">Phone</TableHead>
                    <TableHead className="w-[100px]">Designation</TableHead>
                    <TableHead className="w-[100px]">Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton columns={7} rows={10} />
                  ) : (
                    users.items.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell className="flex items-center gap-3">
                          <UserAvatar 
                            src={user.profileImage?.url} 
                            firstName={user.firstName}
                            lastName={user.lastName}
                          />
                          <span className="truncate">{user.firstName} {user.lastName}</span>
                        </TableCell>
                        <TableCell className="truncate">{user.email}</TableCell>
                        <TableCell>{user.phoneNumber || '-'}</TableCell>
                        <TableCell>{user.designation || '-'}</TableCell>
                        <TableCell className="capitalize">{user.role?.name || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.company?.logo && (
                              <Image 
                                src={user.company.logo.url} 
                                alt={user.company.name || ''}
                                width={24}
                                height={24}
                                className="rounded object-contain"
                              />
                            )}
                            <span className="truncate">{user.company?.name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewId(user.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {users && (
                <div className="mt-4">
                  <Pagination
                    currentPage={page}
                    totalPages={users.meta.totalPages}
                    onPageChange={setPage}
                    totalItems={users.meta.totalItems}
                    pageSize={limit}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}