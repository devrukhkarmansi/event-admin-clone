import { api } from "@/lib/api"
import { UsersResponse, User } from "./types"

export const usersService = {
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