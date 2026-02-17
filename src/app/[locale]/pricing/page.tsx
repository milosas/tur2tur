import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PricingCards } from "@/components/pricing/PricingCards";
import type { SubscriptionTier } from "@/lib/types";

export default async function PricingPage() {
  const t = await getTranslations("Pricing");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentTier: SubscriptionTier = "free";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier")
      .eq("id", user.id)
      .single();
    currentTier = (profile?.subscription_tier as SubscriptionTier) ?? "free";
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">{t("title")}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
      </div>
      <PricingCards currentTier={currentTier} isLoggedIn={!!user} />
    </div>
  );
}
