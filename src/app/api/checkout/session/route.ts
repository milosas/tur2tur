import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  // Require authentication to prevent session data leakage
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    // Only allow the session owner to retrieve their own session
    if (session.metadata?.supabase_user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      status: session.status,
      customerEmail: session.customer_details?.email,
      plan: session.metadata?.plan,
    });
  } catch {
    return NextResponse.json({ error: "Failed to retrieve session" }, { status: 500 });
  }
}
