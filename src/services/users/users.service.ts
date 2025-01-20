import { api } from "@/lib/api"
import { UsersResponse, User } from "./types"

interface FindAllParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export const usersService = {
  findAll: async ({ 
    page = 1, 
    limit = 10,
    search,
    role,
    sortBy = "createdAt",
    sortOrder = "DESC"
  }: FindAllParams): Promise<UsersResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(role && { role }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder })
    })
    
     return api.get<UsersResponse>(`/admin/user?${params}`)
    
  },

  getUsers: (page = 1, limit = 10) => {
    return api.get<UsersResponse>(`/admin/user?page=${page}&limit=${limit}`)
  },

  getUser: (id: string) => {
    return api.get<User>(`/admin/user/${id}`)
  },

  importUsers: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<void>('/admin/user/import', formData)
  }
} 