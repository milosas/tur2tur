/**
 * Seed script: creates 3 test tournaments (one per format) with teams, groups, and matches.
 * Run with: npx tsx scripts/seed-test-data.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getOrganizerId(): Promise<string> {
  // Get the first user from tournaments table as organizer
  const { data } = await supabase
    .from("tournaments")
    .select("organizer_id")
    .limit(1)
    .single();

  if (data?.organizer_id) return data.organizer_id;

  // Fallback: get from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .limit(1)
    .single();

  if (profile?.id) return profile.id;
  throw new Error("No user found in DB. Log in via the app first.");
}

async function createTeams(tournamentId: string, names: string[]) {
  const inserts = names.map((name) => ({
    tournament_id: tournamentId,
    name,
  }));
  const { data, error } = await supabase
    .from("teams")
    .insert(inserts)
    .select("id, name");
  if (error) throw error;
  return data!;
}

// ─── Tournament 1: Group + Playoff (8 teams, completed groups, partial playoff) ───

async function seedGroupPlayoff(organizerId: string) {
  console.log("Creating Group + Playoff tournament...");

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .insert({
      organizer_id: organizerId,
      name: "Baltic Cup 2026",
      description:
        "Kasmetinis Baltijos regiono futbolo turnyras su 8 komandomis. Grupių etapas + atkrintamosios.",
      format: "group_playoff",
      status: "in_progress",
      max_teams: 8,
      start_date: "2026-03-15",
    })
    .select()
    .single();

  if (error) throw error;
  const tid = tournament!.id;

  const teams = await createTeams(tid, [
    "Vilnius FC",
    "Kaunas United",
    "Klaipėda City",
    "Šiauliai Stars",
    "Riga Dynamo",
    "Liepāja FK",
    "Tallinn Rangers",
    "Tartu Athletic",
  ]);

  const t = (name: string) => teams.find((x) => x.name === name)!.id;

  // Create 2 groups of 4
  const { data: groupsData } = await supabase
    .from("tournament_groups")
    .insert([
      { tournament_id: tid, name: "A", team_ids: [t("Vilnius FC"), t("Kaunas United"), t("Klaipėda City"), t("Šiauliai Stars")] },
      { tournament_id: tid, name: "B", team_ids: [t("Riga Dynamo"), t("Liepāja FK"), t("Tallinn Rangers"), t("Tartu Athletic")] },
    ])
    .select();

  const gA = groupsData![0].id;
  const gB = groupsData![1].id;

  // Group A matches (all completed)
  const groupAMatches = [
    { round: 1, match_number: 1, home: "Vilnius FC", away: "Kaunas United", hs: 2, as: 1 },
    { round: 1, match_number: 2, home: "Klaipėda City", away: "Šiauliai Stars", hs: 0, as: 0 },
    { round: 2, match_number: 3, home: "Vilnius FC", away: "Klaipėda City", hs: 3, as: 1 },
    { round: 2, match_number: 4, home: "Kaunas United", away: "Šiauliai Stars", hs: 1, as: 2 },
    { round: 3, match_number: 5, home: "Vilnius FC", away: "Šiauliai Stars", hs: 1, as: 1 },
    { round: 3, match_number: 6, home: "Kaunas United", away: "Klaipėda City", hs: 2, as: 0 },
  ];

  // Group B matches (all completed)
  const groupBMatches = [
    { round: 1, match_number: 7, home: "Riga Dynamo", away: "Liepāja FK", hs: 1, as: 0 },
    { round: 1, match_number: 8, home: "Tallinn Rangers", away: "Tartu Athletic", hs: 2, as: 2 },
    { round: 2, match_number: 9, home: "Riga Dynamo", away: "Tallinn Rangers", hs: 0, as: 1 },
    { round: 2, match_number: 10, home: "Liepāja FK", away: "Tartu Athletic", hs: 3, as: 1 },
    { round: 3, match_number: 11, home: "Riga Dynamo", away: "Tartu Athletic", hs: 2, as: 0 },
    { round: 3, match_number: 12, home: "Liepāja FK", away: "Tallinn Rangers", hs: 1, as: 1 },
  ];

  const matchInserts = [
    ...groupAMatches.map((m) => ({
      tournament_id: tid,
      group_id: gA,
      round: m.round,
      match_number: m.match_number,
      home_team_id: t(m.home),
      away_team_id: t(m.away),
      home_score: m.hs,
      away_score: m.as,
      status: "completed" as const,
      stage: "group" as const,
    })),
    ...groupBMatches.map((m) => ({
      tournament_id: tid,
      group_id: gB,
      round: m.round,
      match_number: m.match_number,
      home_team_id: t(m.home),
      away_team_id: t(m.away),
      home_score: m.hs,
      away_score: m.as,
      status: "completed" as const,
      stage: "group" as const,
    })),
  ];

  // Playoff: Semifinals + Final
  // Group A: 1st Vilnius FC (7pts), 2nd Kaunas United (6pts)
  // Group B: 1st Riga Dynamo (6pts), 2nd Tallinn Rangers (5pts)
  const playoffInserts = [
    // Semifinal 1: A1 vs B2
    {
      tournament_id: tid,
      round: 1,
      match_number: 1,
      home_team_id: t("Vilnius FC"),
      away_team_id: t("Tallinn Rangers"),
      home_score: 3,
      away_score: 1,
      status: "completed" as const,
      stage: "playoff" as const,
    },
    // Semifinal 2: B1 vs A2
    {
      tournament_id: tid,
      round: 1,
      match_number: 2,
      home_team_id: t("Riga Dynamo"),
      away_team_id: t("Kaunas United"),
      home_score: 2,
      away_score: 2, // will be decided on penalties in real life, but let's make Riga win
      status: "completed" as const,
      stage: "playoff" as const,
    },
    // Final: Vilnius vs Riga (not yet played)
    {
      tournament_id: tid,
      round: 2,
      match_number: 3,
      home_team_id: t("Vilnius FC"),
      away_team_id: t("Riga Dynamo"),
      home_score: null,
      away_score: null,
      status: "scheduled" as const,
      stage: "playoff" as const,
    },
  ];

  await supabase.from("matches").insert([...matchInserts, ...playoffInserts]);
  console.log(`  ✓ Baltic Cup 2026 created (id: ${tid})`);
}

// ─── Tournament 2: Round Robin (5 teams, partially played) ───

async function seedRoundRobin(organizerId: string) {
  console.log("Creating Round Robin tournament...");

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .insert({
      organizer_id: organizerId,
      name: "Vilnius City League",
      description: "5 komandų miesto lyga. Visi žaidžia prieš visus.",
      format: "round_robin",
      status: "in_progress",
      max_teams: 5,
      start_date: "2026-04-01",
    })
    .select()
    .single();

  if (error) throw error;
  const tid = tournament!.id;

  const teams = await createTeams(tid, [
    "Žalgiris B",
    "Sakalai",
    "Vilko Komanda",
    "Ąžuolai",
    "Perkūnas",
  ]);

  const t = (name: string) => teams.find((x) => x.name === name)!.id;

  // 5 teams = 10 matches total (4 rounds with bye rotation)
  const matches = [
    // Round 1
    { round: 1, mn: 1, home: "Žalgiris B", away: "Perkūnas", hs: 3, as: 0, status: "completed" },
    { round: 1, mn: 2, home: "Sakalai", away: "Ąžuolai", hs: 1, as: 1, status: "completed" },
    // Round 2
    { round: 2, mn: 3, home: "Žalgiris B", away: "Ąžuolai", hs: 2, as: 0, status: "completed" },
    { round: 2, mn: 4, home: "Vilko Komanda", away: "Perkūnas", hs: 0, as: 1, status: "completed" },
    // Round 3
    { round: 3, mn: 5, home: "Žalgiris B", away: "Vilko Komanda", hs: 4, as: 2, status: "completed" },
    { round: 3, mn: 6, home: "Sakalai", away: "Perkūnas", hs: 2, as: 3, status: "completed" },
    // Round 4 (not yet played)
    { round: 4, mn: 7, home: "Žalgiris B", away: "Sakalai", hs: null, as: null, status: "scheduled" },
    { round: 4, mn: 8, home: "Vilko Komanda", away: "Ąžuolai", hs: null, as: null, status: "scheduled" },
    // Round 5
    { round: 5, mn: 9, home: "Sakalai", away: "Vilko Komanda", hs: null, as: null, status: "scheduled" },
    { round: 5, mn: 10, home: "Ąžuolai", away: "Perkūnas", hs: null, as: null, status: "scheduled" },
  ];

  const inserts = matches.map((m) => ({
    tournament_id: tid,
    round: m.round,
    match_number: m.mn,
    home_team_id: t(m.home),
    away_team_id: t(m.away),
    home_score: m.hs,
    away_score: m.as,
    status: m.status,
    stage: "round_robin" as const,
  }));

  await supabase.from("matches").insert(inserts);
  console.log(`  ✓ Vilnius City League created (id: ${tid})`);
}

// ─── Tournament 3: Single Elimination (6 teams, some played) ───

async function seedSingleElimination(organizerId: string) {
  console.log("Creating Single Elimination tournament...");

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .insert({
      organizer_id: organizerId,
      name: "Kaunas Knockout Cup",
      description: "Greitas eliminacijos turnyras. Pralaimi — iškrenti!",
      format: "single_elimination",
      status: "in_progress",
      max_teams: 6,
      start_date: "2026-05-10",
    })
    .select()
    .single();

  if (error) throw error;
  const tid = tournament!.id;

  const teams = await createTeams(tid, [
    "Thunder FC",
    "Storm United",
    "Lightning XI",
    "Tornado SK",
    "Cyclone FC",
    "Blizzard FC",
  ]);

  const t = (name: string) => teams.find((x) => x.name === name)!.id;

  // 6 teams → 8 slots → 2 byes in round 1
  // Round 1 (Quarterfinals): 4 matches, 2 are real, 2 are byes
  const matches = [
    // Round 1: 4 matches (2 real + 2 byes with null opponent)
    { round: 1, mn: 1, home: "Thunder FC", away: "Storm United", hs: 2, as: 1, status: "completed" },
    { round: 1, mn: 2, home: "Lightning XI", away: "Tornado SK", hs: 0, as: 3, status: "completed" },
    { round: 1, mn: 3, home: "Cyclone FC", away: null, hs: null, as: null, status: "scheduled" }, // bye
    { round: 1, mn: 4, home: "Blizzard FC", away: null, hs: null, as: null, status: "scheduled" }, // bye
    // Round 2 (Semifinals): Thunder vs Tornado, Cyclone vs Blizzard
    { round: 2, mn: 5, home: "Thunder FC", away: "Tornado SK", hs: 1, as: 0, status: "completed" },
    { round: 2, mn: 6, home: "Cyclone FC", away: "Blizzard FC", hs: 3, as: 2, status: "completed" },
    // Round 3 (Final)
    { round: 3, mn: 7, home: "Thunder FC", away: "Cyclone FC", hs: null, as: null, status: "scheduled" },
  ];

  const inserts = matches.map((m) => ({
    tournament_id: tid,
    round: m.round,
    match_number: m.mn,
    home_team_id: m.home ? t(m.home) : null,
    away_team_id: m.away ? t(m.away) : null,
    home_score: m.hs,
    away_score: m.as,
    status: m.status,
    stage: "elimination" as const,
  }));

  await supabase.from("matches").insert(inserts);
  console.log(`  ✓ Kaunas Knockout Cup created (id: ${tid})`);
}

// ─── Main ───

async function main() {
  console.log("Seeding test tournament data...\n");

  const organizerId = await getOrganizerId();
  console.log(`Using organizer: ${organizerId}\n`);

  await seedGroupPlayoff(organizerId);
  await seedRoundRobin(organizerId);
  await seedSingleElimination(organizerId);

  console.log("\n✅ All done! Refresh your browser to see the tournaments.");
}

main().catch(console.error);
