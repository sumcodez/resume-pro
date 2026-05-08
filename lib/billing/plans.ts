export const PLAN_PRICING = {
  free: {
    name: "Free",
    priceLabel: "₹0/month",
    initialScans: 2,
    monthlyScansAfterTrial: 1,
  },
  pro: {
    name: "Pro",
    priceLabel: "₹200/month",
    monthlyScans: 4,
  },
} as const;

export type PlanType = keyof typeof PLAN_PRICING;
