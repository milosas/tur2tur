import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

export const PRICES: Record<string, string> = {
  single: process.env.STRIPE_PRICE_SINGLE ?? "",
  unlimited: process.env.STRIPE_PRICE_UNLIMITED ?? "",
};

export const FREE_TOURNAMENT_LIMIT = 5;
