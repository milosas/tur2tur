import { NextResponse } from "next/server";

// TEMPORARY: Remove after debugging Hostinger env vars
export async function GET() {
  return NextResponse.json({
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? `set (${process.env.STRIPE_SECRET_KEY.substring(0, 10)}...)` : "MISSING",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? `set (${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 10)}...)` : "MISSING",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "set" : "MISSING",
    STRIPE_PRICE_SINGLE: process.env.STRIPE_PRICE_SINGLE || "MISSING",
    STRIPE_PRICE_UNLIMITED: process.env.STRIPE_PRICE_UNLIMITED || "MISSING",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "MISSING",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "set" : "MISSING",
    NODE_ENV: process.env.NODE_ENV || "MISSING",
  });
}
