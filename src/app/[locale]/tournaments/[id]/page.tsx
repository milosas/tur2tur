import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TournamentDetail } from "./TournamentDetail";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("name, description, format")
    .eq("id", id)
    .single();

  if (!tournament) {
    return { title: "Turnyras nerastas" };
  }

  const description = tournament.description || `${tournament.name} - sporto turnyras platformoje tur2tur`;

  return {
    title: tournament.name,
    description,
    openGraph: {
      title: tournament.name,
      description,
      type: "website",
    },
  };
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("*")
    .eq("id", id)
    .single();

  if (!tournament) {
    notFound();
  }

  // Block non-public or draft tournaments for non-owners
  if (tournament.visibility !== "public" || tournament.status === "draft") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== tournament.organizer_id) {
      notFound();
    }
  }

  // Parallel fetch all independent data
  const [
    { data: teams },
    { data: groups },
    { data: matches },
    { data: organizer },
    { count: organizerTournamentCount },
  ] = await Promise.all([
    supabase
      .from("teams")
      .select("*, team_players(*)")
      .eq("tournament_id", tournament.id)
      .order("name"),
    supabase
      .from("tournament_groups")
      .select("*")
      .eq("tournament_id", tournament.id)
      .order("name"),
    supabase
      .from("matches")
      .select("*")
      .eq("tournament_id", tournament.id)
      .order("stage")
      .order("round")
      .order("match_number"),
    supabase
      .from("profiles")
      .select("*")
      .eq("id", tournament.organizer_id)
      .single(),
    supabase
      .from("tournaments")
      .select("id", { count: "exact", head: true })
      .eq("organizer_id", tournament.organizer_id),
  ]);

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 overflow-hidden">
      <TournamentDetail
        tournament={tournament}
        teams={teams ?? []}
        groups={groups ?? []}
        matches={matches ?? []}
        organizer={organizer}
        organizerTournamentCount={organizerTournamentCount ?? 0}
        locale={locale}
      />
    </div>
  );
}
