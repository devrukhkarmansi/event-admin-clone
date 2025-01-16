"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"
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
import { Pagination } from "@/components/ui/pagination"

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const limit = 10
  const { data: users, isLoading } = useUsers(page, limit)
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