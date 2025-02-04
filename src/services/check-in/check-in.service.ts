import { api } from "@/lib/api"
import { CheckInFilters, CheckInsResponse } from "./types"

export const checkInService = {
  getTodayCount: async () => {
    const response = await api.get<{ count: number }>('/check-in/today-count')
    return response
  },
  
  getCheckIns: async (filters: CheckInFilters) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => [k, String(v)])
    )
    const response = await api.get<CheckInsResponse>(`/check-in?${new URLSearchParams(params)}`)
    return response
  }
} 