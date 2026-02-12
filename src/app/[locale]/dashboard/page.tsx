import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./DashboardContent";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("*")
    .eq("organizer_id", user.id)
    .order("created_at", { ascending: false });

  const t = await getTranslations("Dashboard");

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardContent tournaments={tournaments ?? []} />
    </div>
  );
}
