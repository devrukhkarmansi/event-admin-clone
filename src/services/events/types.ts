export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  status: 'draft' | 'published' | 'cancelled';
  logo?: {
    url: string;
  };
}

export interface CreateEventParams extends Record<string, unknown> {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  logo?: File;
} 