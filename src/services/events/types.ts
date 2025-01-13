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
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  address: Address;
  logo?: {
    url: string;
  };
  sponsors?: Sponsor[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSponsorParams {
  name: string;
  type: SponsorType;
  description?: string;
  logo?: File;
}

export interface UpdateSponsorParams extends Partial<CreateSponsorParams> {
  id: string | number;
} 