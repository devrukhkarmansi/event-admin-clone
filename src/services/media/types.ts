export interface MediaUploadResponse {
  id: number
  url: string
}

export enum MediaType {
  USER_PROFILE_IMAGE = 'USER_PROFILE_IMAGE',
  EVENT_LOGO = 'EVENT_LOGO',
  COMPANY_LOGO = 'COMPANY_LOGO',
  SPONSOR_LOGO = 'SPONSOR_LOGO',
  SESSION_BANNER = 'SESSION_BANNER'
} 