export interface CheckIn {
  id: number
  userId: string
  user: {
    email: string
    firstName: string
    lastName: string
    profileImage?: {
      url: string
    }
  }
  createdAt: string
}

export interface CheckInFilters {
  email?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  sortOrder?: 'ASC' | 'DESC'
}

export interface CheckInsResponse {
    items: CheckIn[]
    meta: {
      totalItems: number
      itemCount: number
      itemsPerPage: number
      totalPages: number
      currentPage: number
  }
} 