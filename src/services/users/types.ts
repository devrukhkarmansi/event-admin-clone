export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  isActive: boolean
  phoneNumber: string | null
  designation: string | null
  profileBanner?: {
    url: string
  } | null
  role: {
    id: number
    name: string
    description: string | null
  }
  profileImage: { url: string } | null
  company: {
    name: string
    description?: string | null
    website?: string | null
    logo?: {
      url: string
    }
  } | null
  speakerSessions?: {
    id: number
    title: string
    description: string
    sessionType: string
    startTime: string
    endTime: string
    difficultyLevel: string
    capacity: number
    status: string
    isHighlighted: boolean
    tracks: {
      id: number
      name: string
    }[]
    location: {
      id: number
      name: string
      description: string
    }
    banner?: {
      id: number
      url: string
      fileName: string
    }
  }[]
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