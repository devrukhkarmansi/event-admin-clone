import { useQuery } from "@tanstack/react-query"
import { checkInService } from "@/services/check-in/check-in.service"
import { CheckInFilters } from "@/services/check-in/types"

export function useCheckInCount() {
  return useQuery({
    queryKey: ['check-in-count'],
    queryFn: () => checkInService.getTodayCount()
  })
}

export function useCheckIns(filters: CheckInFilters) {
  return useQuery({
    queryKey: ['check-ins', filters],
    queryFn: () => checkInService.getCheckIns(filters)
  })
} 