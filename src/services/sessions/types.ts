export enum SessionType {
  WORKSHOP = 'workshop',
  TALK = 'talk',
  PANEL = 'panel'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export interface Session {
  id: number
  title: string
  description?: string
  sessionType?: SessionType
  startTime?: string | ""
  endTime?: string | ""
  locationId?: number | null
  capacity?: number | 0
  difficultyLevel?: DifficultyLevel | ""
  status?: string | "draft"
  isHighlighted?: boolean | null
  trackId?: number | null
  tracks?: {
    id: number
    name: string
    description: string
  }[]
  speakerId?: string | undefined
  speaker?: {
    id: string
    firstName: string
    lastName: string
    email: string
    bio: string | null
    isActive: boolean
    phoneNumber: string | null
    countryCode: string | null
  }
  location?: {
    id: number
    name: string
    description: string
    capacity: number
    floor: string
    building: string
  }
  bannerId?: number | null
  banner?: {
    url: string
  }
}

export interface CreateSessionParams {
  title: string
  description?: string
  sessionType?: SessionType
  startTime?: string | ""
  endTime?: string | ""
  locationId?: number | null
  capacity?: number | 0
  difficultyLevel?: DifficultyLevel | ""
  speakerId?: string | undefined
  trackId?: number | null
  bannerImage?: {
    url: string
  }
  status?: string | "draft"
  isHighlighted?: boolean | null
}

export interface UpdateSessionParams extends Partial<CreateSessionParams> {
  id: number
  bannerId?: number
}

export interface SessionFilters {
  search?: string
  sessionType?: SessionType
  difficultyLevel?: DifficultyLevel
  startTimeFrom?: string
  startTimeTo?: string
  endTimeFrom?: string
  endTimeTo?: string
  locationId?: number
  trackId?: number
  speakerId?: string
  status?: string
  isHighlighted?: boolean
  page?: number
  limit?: number
}

export type SessionsResponse = {
  items: Session[]
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
} 