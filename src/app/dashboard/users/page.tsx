"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Search, ArrowUpDown } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
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
                    <TableHead className="w-[100px]">Role</TableHead>
                    <TableHead>Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton columns={5} rows={10} />
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