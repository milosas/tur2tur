import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, PRICES } from "@/lib/stripe";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Step 1: Auth
  let supabase;
  try {
    supabase = await createClient();
  } catch (err) {
    return NextResponse.json({ error: "STEP1_SUPABASE_INIT: " + String(err) }, { status: 500 });
  }

  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    return NextResponse.json({ error: "STEP1_AUTH: " + String(err) }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!rateLimit(`checkout:${user.id}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Step 2: Parse body
  let plan: string;
  try {
    const body = await req.json();
    plan = body.plan;
  } catch (err) {
    return NextResponse.json({ error: "STEP2_PARSE_BODY: " + String(err) }, { status: 400 });
  }

  if (plan !== "single" && plan !== "unlimited") {
    return NextResponse.json({ error: "Invalid plan: " + plan }, { status: 400 });
  }

  // Step 3: Verify Stripe config
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "STEP3: missing STRIPE_SECRET_KEY" }, { status: 500 });
  }
  if (!PRICES[plan]) {
    return NextResponse.json({
      error: `STEP3: missing price ID for ${plan}. STRIPE_PRICE_SINGLE=${process.env.STRIPE_PRICE_SINGLE ? "set" : "MISSING"}, STRIPE_PRICE_UNLIMITED=${process.env.STRIPE_PRICE_UNLIMITED ? "set" : "MISSING"}`,
    }, { status: 500 });
  }

  // Step 4: Get or create profile
  let customerId: string | null = null;
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: "STEP4_PROFILE: " + profileError.message + " (code: " + profileError.code + ")" }, { status: 500 });
    }

    // Create profile if it doesn't exist
    if (!profile) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: user.id, full_name: user.user_metadata?.full_name ?? null });

      if (insertError) {
        return NextResponse.json({ error: "STEP4_CREATE_PROFILE: " + insertError.message }, { status: 500 });
      }
    }

    customerId = profile?.stripe_customer_id ?? null;
  } catch (err) {
    return NextResponse.json({ error: "STEP4_PROFILE_CATCH: " + String(err) }, { status: 500 });
  }

  // Step 5: Create Stripe customer if needed
  if (!customerId) {
    try {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    } catch (err) {
      return NextResponse.json({ error: "STEP5_STRIPE_CUSTOMER: " + String(err) }, { status: 500 });
    }
  }

  // Step 6: Create checkout session
  try {
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
      return_url: `https://tur2tur.com/pricing/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        supabase_user_id: user.id,
        plan,
      },
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    return NextResponse.json({ error: "STEP6_CHECKOUT_SESSION: " + String(err) }, { status: 500 });
  }
}
