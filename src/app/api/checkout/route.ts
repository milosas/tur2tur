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
    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

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

    const ALLOWED_ORIGINS = [
      process.env.NEXT_PUBLIC_SITE_URL,
      "https://tur2tur.com",
      ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
    ].filter(Boolean);
    const rawOrigin = req.headers.get("origin") || "";
    const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? rawOrigin : ALLOWED_ORIGINS[0]!;

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
