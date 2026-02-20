import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PRICES } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`checkout:${user.id}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { plan } = await req.json();
  if (plan !== "single" && plan !== "unlimited") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    // Verify Stripe config
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe not configured: missing secret key" }, { status: 500 });
    }
    if (!PRICES[plan]) {
      return NextResponse.json({ error: `Stripe not configured: missing price ID for ${plan}` }, { status: 500 });
    }

    // Get or create Stripe customer
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile query error:", profileError);
      return NextResponse.json({ error: `Profile error: ${profileError.message}` }, { status: 500 });
    }

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const PRODUCTION_URL = "https://tur2tur.com";
    const ALLOWED_ORIGINS = [
      PRODUCTION_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
      ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000", "http://localhost:3002"] : []),
    ].filter(Boolean);
    const rawOrigin = req.headers.get("origin") || "";
    // Always prefer production URL for Stripe return
    const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? PRODUCTION_URL : PRODUCTION_URL;

    const session = await getStripe().checkout.sessions.create({
      ui_mode: "embedded",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICES[plan],
          quantity: 1,
        },
      ],
      mode: plan === "unlimited" ? "subscription" : "payment",
      return_url: `${origin}/pricing/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
