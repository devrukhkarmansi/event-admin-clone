export enum SponsorType {
  PLATINUM = 'platinum',
  GOLD = 'gold',
  SILVER = 'silver',
  BRONZE = 'bronze'
}

export interface Sponsor {
  id: string | number;
  name: string;
  sponsorType: SponsorType;
  description?: string;
  logoId?: number | null;
  logo?: {
    url: string;
  };
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Event {
  id: number;
  name: string;
  description: string;
  logo?: { id: number; url: string };
  address: Address;
  sponsors?: Sponsor[];
  createdAt: string;
  updatedAt: string;
  floorPlans?: FloorPlan[];
}

export interface FloorPlan {
  id: number;
  eventId: number;
  mediaId: number;
  label: string;
  createdAt: string;
  updatedAt: string;
  media: {
    id: number;
    fileName: string;
    url: string;
    assetId: string;
    creatorId: string;
    provider: string;
  };
}

export interface CreateSponsorParams {
  name: string;
  type: SponsorType;
  description?: string;
  logoId?: number;
}

export interface UpdateSponsorParams extends Partial<CreateSponsorParams> {
  id: string | number;
}

export type SponsorsResponse = Sponsor[] 