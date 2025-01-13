export interface Session {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  speakers: Speaker[];
  eventId: string;
}

export interface Speaker {
  id: string;
  name: string;
  bio: string;
  avatar?: {
    url: string;
  };
}

export interface CreateSessionParams extends Record<string, unknown> {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  eventId: string;
  speakers: string[];
} 