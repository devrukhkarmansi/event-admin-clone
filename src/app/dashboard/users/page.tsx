"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Upload } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
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
import { useToast } from "@/components/ui/toast"

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { data: users, isLoading, isPending } = useUsers(page, limit)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
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
                  {users.items.map((user) => (
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
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(old => Math.max(1, old - 1))}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-sm">Page</span>
                  <span className="text-sm font-medium">{users?.meta.currentPage}</span>
                  <span className="text-sm text-muted-foreground">
                    of {users?.meta.totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!isPending && users?.meta.currentPage < users?.meta.totalPages) {
                      setPage(old => old + 1)
                    }
                  }}
                  disabled={isPending || !users?.meta || users.meta.currentPage >= users.meta.totalPages}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}