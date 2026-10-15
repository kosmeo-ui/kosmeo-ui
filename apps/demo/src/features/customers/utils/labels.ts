import type { CustomerStatus, Plan } from "@/types/api";

export const PLAN_LABELS: Record<Plan, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

export const PLAN_PRICES: Record<Plan, number> = {
  starter: 29,
  growth: 99,
  enterprise: 499,
};

export const STATUS_VARIANTS = {
  active: "success",
  trial: "warning",
  churned: "secondary",
} as const satisfies Record<CustomerStatus, string>;

export const TAG_OPTIONS = [
  "Beta program",
  "Champion",
  "Needs onboarding",
  "Renewal due",
  "Upsell",
  "Partner",
  "At risk",
];
