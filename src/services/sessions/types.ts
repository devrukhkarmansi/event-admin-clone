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
  speakerId: string
  trackId?: number
  track?: {
    id: number
    name: string
  }
  speaker?: {
    id: string
    firstName: string
    lastName: string
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
}

export interface UpdateSessionParams extends Partial<CreateSessionParams> {
  id: number
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