export interface RequestOtpParams extends Record<string, unknown> {
  recipient: string;
  channel: 'email' | 'phone';
  countryCode?: string;
}

export interface VerifyOtpParams extends Record<string, unknown> {
  recipient: string;
  channel: 'email' | 'phone';
  countryCode?: string;
  code: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'organizer';
  profileImage?: {
    url: string;
  };
} 