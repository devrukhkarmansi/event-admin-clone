export interface Location {
  id: number;
  name: string;
  description: string;
  capacity: number;
  floor: string;
  building: string;
  floorPlan?: {
    id: number;
    url: string;
  };
}

export interface CreateLocationParams {
  name: string;
  description: string;
  capacity: number;
  floor: string;
  building: string;
  floorPlanId?: number;
}

export interface UpdateLocationParams extends Partial<CreateLocationParams> {
  id: number;
}

export type LocationsResponse = Location[];
