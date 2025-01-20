import { useQuery } from "@tanstack/react-query"
import { usersService } from "@/services/users/users.service"

interface UseUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export function useUsers({
  page = 1,
  limit = 10,
  search,
  role,
  sortBy = "createdAt",
  sortOrder = "DESC"
}: UseUsersParams = {}) {
  return useQuery({
    queryKey: ['users', { 
      page, 
      limit,
      search,
      role,
      sortBy,
      sortOrder
    }],
    queryFn: () => usersService.findAll({ 
      page, 
      limit, 
      search,
      role,
      sortBy,
      sortOrder
    })
  })
} 