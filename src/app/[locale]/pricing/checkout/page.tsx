import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "@/components/pricing/CheckoutForm";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { plan } = await searchParams;

  if (plan !== "single" && plan !== "unlimited") {
    redirect("/pricing");
  }

  const t = await getTranslations("Pricing");

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2 text-center">
        {plan === "single" ? t("single") : t("unlimited")}
      </h1>
      <p className="text-muted-foreground text-center mb-8">
        {plan === "single" ? t("singleDesc") : t("unlimitedDesc")}
      </p>
      <CheckoutForm plan={plan} />
    </div>
  );
}
