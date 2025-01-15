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
  description: string
  sessionType: SessionType
  startTime: string
  endTime: string
  locationId: number
  capacity: number
  difficultyLevel: DifficultyLevel
  status: string
  trackId?: number
  tracks?: {
    id: number
    name: string
    description: string
  }[]
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
  banner?: {
    url: string
  }
}

export interface CreateSessionParams {
  title: string
  description: string
  sessionType: SessionType
  startTime: string
  endTime: string
  locationId: number
  capacity: number
  difficultyLevel: DifficultyLevel
  speakerId: string
  trackId?: number
  bannerImage?: {
    url: string
  }
  status?: string
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
  page?: number
  limit?: number
}

export type SessionsResponse = {
  items: Session[]
  meta: {
    total: number
    page: number
    limit: number
  }
} 