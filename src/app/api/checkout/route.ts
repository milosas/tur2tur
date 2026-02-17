import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PRICES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();
  if (plan !== "single" && plan !== "unlimited") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

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

  const origin = req.headers.get("origin") || "http://localhost:3000";

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
}
