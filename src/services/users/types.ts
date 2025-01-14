export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  isActive: boolean
  phoneNumber: string | null
  profileImage: { url: string } | null
  company: {
    name: string
    logo?: {
      url: string
    }
  } | null
  // ... other fields
}

export interface UsersResponse {
  items: User[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
} 