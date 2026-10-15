export type Plan = "starter" | "growth" | "enterprise";
export type CustomerStatus = "active" | "trial" | "churned";

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  plan: Plan;
  status: CustomerStatus;
  mrr: number;
  seats: number;
  signedUp: string;
  street1: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  countryCode: string;
  tags: string[];
  notes?: string;
}

export type CustomerInput = Omit<Customer, "id" | "status" | "mrr">;

/** The cursor-paginated list shape `useInfiniteCursor` expects. */
export interface CursorPage<T> {
  data: T[];
  hasMore: boolean;
  limit: number;
  nextCursor: string | null;
}

export interface Stats {
  total: number;
  active: number;
  trial: number;
  churned: number;
  mrr: number;
  seats: number;
}
