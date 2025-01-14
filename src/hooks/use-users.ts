import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { usersService } from "@/services/users/users.service"

export function useUsers(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () => usersService.getUsers(page, limit),
    placeholderData: keepPreviousData
  })
} 