export interface Track {
  id: number
  name: string
  description: string
  sessions?: {
    id: number
    title: string
  }[]
}

export interface CreateTrackParams {
  name: string
  description: string
}

export interface UpdateTrackParams extends Partial<CreateTrackParams> {
  id: number
}

export type TracksResponse = Track[] 