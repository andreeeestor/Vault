import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-06-24.dahlia",
});

export const PLANS = {
  free: { name: "Free", priceId: null, storageLimit: 500 * 1024 * 1024 },
  pro: { name: "Pro", priceId: process.env.STRIPE_PRICE_PRO, storageLimit: 50 * 1024 * 1024 * 1024 },
  business: {
    name: "Business",
    priceId: process.env.STRIPE_PRICE_BUSINESS,
    storageLimit: 500 * 1024 * 1024 * 1024,
  },
} as const;

export type PlanId = keyof typeof PLANS;
