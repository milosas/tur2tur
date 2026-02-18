import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account" },
      { status: 400 }
    );
  }

  const ALLOWED_ORIGINS = [
    process.env.NEXT_PUBLIC_SITE_URL,
    "https://tur2tur.com",
    "http://localhost:3000",
  ].filter(Boolean);
  const rawOrigin = req.headers.get("origin") || "";
  const origin = ALLOWED_ORIGINS.includes(rawOrigin) ? rawOrigin : ALLOWED_ORIGINS[0]!;

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/dashboard/profile`,
  });

  return NextResponse.json({ url: portalSession.url });
}
