import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PricingCards } from "@/components/pricing/PricingCards";
import { PageBanner } from "@/components/PageBanner";
import type { SubscriptionTier } from "@/lib/types";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Pricing");
  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

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
    <>
      <PageBanner
        title={t("title")}
        subtitle={t("subtitle")}
        photo="basketball"
      />
      <div className="container mx-auto px-4 py-12">
        <PricingCards currentTier={currentTier} isLoggedIn={!!user} />
      </div>
    </>
  );
}
