import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getTeams(tournamentName) {
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id")
    .eq("name", tournamentName)
    .single();
  if (!tournament) throw new Error(`Tournament not found: ${tournamentName}`);

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name")
    .eq("tournament_id", tournament.id)
    .order("name");

  return { tid: tournament.id, teams };
}

async function createGroup(tid, name, teamIds) {
  const { data } = await supabase
    .from("tournament_groups")
    .insert({ tournament_id: tid, name, team_ids: teamIds })
    .select("id")
    .single();
  return data.id;
}

async function insertMatches(matches) {
  const { error } = await supabase.from("matches").insert(matches);
  if (error) throw error;
}

// 1. Kauno Krepšinio Lyga 2026 (group_playoff, in_progress)
async function seedKrepsinisLyga() {
  const { tid, teams: t } = await getTeams("Kauno Krepšinio Lyga 2026");
  const gA = await createGroup(tid, "A grupė", [t[0].id, t[1].id, t[2].id, t[3].id]);
  const gB = await createGroup(tid, "B grupė", [t[4].id, t[5].id, t[6].id, t[7].id]);
  const gC = await createGroup(tid, "C grupė", [t[8].id, t[9].id, t[10].id, t[11].id]);
  const gD = await createGroup(tid, "D grupė", [t[12].id, t[13].id, t[14].id, t[15].id]);

  await insertMatches([
    // Group A
    { tournament_id: tid, group_id: gA, round: 1, match_number: 1, home_team_id: t[0].id, away_team_id: t[1].id, home_score: 78, away_score: 65, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 1, match_number: 2, home_team_id: t[2].id, away_team_id: t[3].id, home_score: 82, away_score: 80, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 2, match_number: 3, home_team_id: t[0].id, away_team_id: t[2].id, home_score: 90, away_score: 72, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 2, match_number: 4, home_team_id: t[1].id, away_team_id: t[3].id, home_score: 68, away_score: 71, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 3, match_number: 5, home_team_id: t[0].id, away_team_id: t[3].id, home_score: 85, away_score: 77, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 3, match_number: 6, home_team_id: t[1].id, away_team_id: t[2].id, home_score: 69, away_score: 74, status: "completed", stage: "group" },
    // Group B
    { tournament_id: tid, group_id: gB, round: 1, match_number: 7, home_team_id: t[4].id, away_team_id: t[5].id, home_score: 88, away_score: 82, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 1, match_number: 8, home_team_id: t[6].id, away_team_id: t[7].id, home_score: 75, away_score: 79, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 2, match_number: 9, home_team_id: t[4].id, away_team_id: t[6].id, home_score: 91, away_score: 85, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 2, match_number: 10, home_team_id: t[5].id, away_team_id: t[7].id, home_score: 70, away_score: 68, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 3, match_number: 11, home_team_id: t[4].id, away_team_id: t[7].id, home_score: 86, away_score: 80, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 3, match_number: 12, home_team_id: t[5].id, away_team_id: t[6].id, home_score: 77, away_score: 73, status: "completed", stage: "group" },
    // Group C
    { tournament_id: tid, group_id: gC, round: 1, match_number: 13, home_team_id: t[8].id, away_team_id: t[9].id, home_score: 64, away_score: 72, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 1, match_number: 14, home_team_id: t[10].id, away_team_id: t[11].id, home_score: 81, away_score: 78, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 2, match_number: 15, home_team_id: t[8].id, away_team_id: t[10].id, home_score: 70, away_score: 65, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 2, match_number: 16, home_team_id: t[9].id, away_team_id: t[11].id, home_score: 83, away_score: 79, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 3, match_number: 17, home_team_id: t[8].id, away_team_id: t[11].id, home_score: 76, away_score: 74, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 3, match_number: 18, home_team_id: t[9].id, away_team_id: t[10].id, home_score: 88, away_score: 82, status: "completed", stage: "group" },
    // Group D
    { tournament_id: tid, group_id: gD, round: 1, match_number: 19, home_team_id: t[12].id, away_team_id: t[13].id, home_score: 71, away_score: 69, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gD, round: 1, match_number: 20, home_team_id: t[14].id, away_team_id: t[15].id, home_score: 66, away_score: 73, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gD, round: 2, match_number: 21, home_team_id: t[12].id, away_team_id: t[14].id, home_score: 80, away_score: 75, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gD, round: 2, match_number: 22, home_team_id: t[13].id, away_team_id: t[15].id, home_score: 78, away_score: 82, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gD, round: 3, match_number: 23, home_team_id: t[12].id, away_team_id: t[15].id, home_score: 84, away_score: 77, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gD, round: 3, match_number: 24, home_team_id: t[13].id, away_team_id: t[14].id, home_score: 72, away_score: 70, status: "completed", stage: "group" },
    // Playoff (partial)
    { tournament_id: tid, round: 4, match_number: 25, home_team_id: t[0].id, away_team_id: t[9].id, home_score: 82, away_score: 78, status: "completed", stage: "playoff" },
    { tournament_id: tid, round: 4, match_number: 26, home_team_id: t[4].id, away_team_id: t[12].id, home_score: null, away_score: null, status: "scheduled", stage: "playoff" },
  ]);
  console.log("✓ Kauno Krepšinio Lyga 2026");
}

// 2. Vilnius Futsal Cup (round_robin, in_progress)
async function seedFutsalCup() {
  const { tid, teams: t } = await getTeams("Vilnius Futsal Cup");
  const matches = [];
  let mn = 1;
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      if (mn <= 40) {
        matches.push({
          tournament_id: tid, round: Math.ceil(mn / 6), match_number: mn,
          home_team_id: t[i].id, away_team_id: t[j].id,
          home_score: Math.floor(Math.random() * 8), away_score: Math.floor(Math.random() * 8),
          status: "completed", stage: "round_robin",
        });
      } else {
        matches.push({
          tournament_id: tid, round: Math.ceil(mn / 6), match_number: mn,
          home_team_id: t[i].id, away_team_id: t[j].id,
          status: "scheduled", stage: "round_robin",
        });
      }
      mn++;
    }
  }
  await insertMatches(matches);
  console.log("✓ Vilnius Futsal Cup");
}

// 3. Baltic Volleyball Open (group_playoff, in_progress)
async function seedVolleyball() {
  const { tid, teams: t } = await getTeams("Baltic Volleyball Open");
  const gA = await createGroup(tid, "A grupė", [t[0].id, t[1].id, t[2].id, t[3].id]);
  const gB = await createGroup(tid, "B grupė", [t[4].id, t[5].id, t[6].id, t[7].id]);

  await insertMatches([
    { tournament_id: tid, group_id: gA, round: 1, match_number: 1, home_team_id: t[0].id, away_team_id: t[1].id, home_score: 3, away_score: 1, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 1, match_number: 2, home_team_id: t[2].id, away_team_id: t[3].id, home_score: 2, away_score: 3, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 2, match_number: 3, home_team_id: t[0].id, away_team_id: t[2].id, home_score: 3, away_score: 0, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 2, match_number: 4, home_team_id: t[1].id, away_team_id: t[3].id, home_score: 3, away_score: 2, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 3, match_number: 5, home_team_id: t[0].id, away_team_id: t[3].id, home_score: 3, away_score: 1, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 3, match_number: 6, home_team_id: t[1].id, away_team_id: t[2].id, home_score: 1, away_score: 3, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 1, match_number: 7, home_team_id: t[4].id, away_team_id: t[5].id, home_score: 3, away_score: 2, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 1, match_number: 8, home_team_id: t[6].id, away_team_id: t[7].id, home_score: 0, away_score: 3, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 2, match_number: 9, home_team_id: t[4].id, away_team_id: t[6].id, home_score: 3, away_score: 1, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 2, match_number: 10, home_team_id: t[5].id, away_team_id: t[7].id, home_score: 2, away_score: 3, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 3, match_number: 11, home_team_id: t[4].id, away_team_id: t[7].id, home_score: 3, away_score: 0, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 3, match_number: 12, home_team_id: t[5].id, away_team_id: t[6].id, home_score: 3, away_score: 1, status: "completed", stage: "group" },
    // Semifinals
    { tournament_id: tid, round: 4, match_number: 13, home_team_id: t[0].id, away_team_id: t[7].id, home_score: 3, away_score: 0, status: "completed", stage: "playoff" },
    { tournament_id: tid, round: 4, match_number: 14, home_team_id: t[4].id, away_team_id: t[3].id, home_score: 3, away_score: 1, status: "completed", stage: "playoff" },
    { tournament_id: tid, round: 5, match_number: 15, home_team_id: t[0].id, away_team_id: t[4].id, home_score: null, away_score: null, status: "scheduled", stage: "playoff" },
  ]);
  console.log("✓ Baltic Volleyball Open");
}

// 4. Pavasario Futbolo Taurė (single_elimination, registration — no scores)
async function seedFutboloTaure() {
  const { tid, teams: t } = await getTeams("Pavasario Futbolo Taurė");
  const matches = [];
  // Round 1 (8 matches)
  for (let i = 0; i < 8; i++) {
    matches.push({
      tournament_id: tid, round: 1, match_number: i + 1,
      home_team_id: t[i].id, away_team_id: t[15 - i].id,
      status: "scheduled", stage: "elimination",
    });
  }
  // Round 2-4 (empty)
  for (let mn = 9; mn <= 15; mn++) {
    matches.push({
      tournament_id: tid, round: mn <= 12 ? 2 : mn <= 14 ? 3 : 4,
      match_number: mn, status: "scheduled", stage: "elimination",
    });
  }
  await insertMatches(matches);
  console.log("✓ Pavasario Futbolo Taurė");
}

// 5. Tarptautinis Rankinio Turnyras (group_playoff, registration — no scores)
async function seedRankinis() {
  const { tid, teams: t } = await getTeams("Tarptautinis Rankinio Turnyras");
  const gA = await createGroup(tid, "A grupė", [t[0].id, t[1].id, t[2].id, t[3].id]);
  const gB = await createGroup(tid, "B grupė", [t[4].id, t[5].id, t[6].id, t[7].id]);
  const gC = await createGroup(tid, "C grupė", [t[8].id, t[9].id, t[10].id, t[11].id]);
  const gD = await createGroup(tid, "D grupė", [t[12].id, t[13].id, t[14].id, t[15].id]);

  const matches = [];
  const groups = [[gA, 0], [gB, 4], [gC, 8], [gD, 12]];
  let mn = 1;
  for (const [gid, off] of groups) {
    const idx = [off, off+1, off+2, off+3];
    const pairs = [[0,1],[2,3],[0,2],[1,3],[0,3],[1,2]];
    let r = 1;
    for (let p = 0; p < pairs.length; p++) {
      if (p % 2 === 0 && p > 0) r++;
      matches.push({
        tournament_id: tid, group_id: gid, round: r, match_number: mn,
        home_team_id: t[idx[pairs[p][0]]].id, away_team_id: t[idx[pairs[p][1]]].id,
        status: "scheduled", stage: "group",
      });
      mn++;
    }
  }
  await insertMatches(matches);
  console.log("✓ Tarptautinis Rankinio Turnyras");
}

// 6. Vasaros Badmintono Čempionatas (round_robin, registration — no scores)
async function seedBadmintonas() {
  const { tid, teams: t } = await getTeams("Vasaros Badmintono Čempionatas");
  const matches = [];
  let mn = 1;
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      matches.push({
        tournament_id: tid, round: Math.ceil(mn / 6), match_number: mn,
        home_team_id: t[i].id, away_team_id: t[j].id,
        status: "scheduled", stage: "round_robin",
      });
      mn++;
    }
  }
  await insertMatches(matches);
  console.log("✓ Vasaros Badmintono Čempionatas");
}

// 7. Žiemos Ledo Ritulio Taurė (single_elimination, completed)
async function seedLedoRitulys() {
  const { tid, teams: t } = await getTeams("Žiemos Ledo Ritulio Taurė");
  await insertMatches([
    { tournament_id: tid, round: 1, match_number: 1, home_team_id: t[0].id, away_team_id: t[7].id, home_score: 5, away_score: 2, status: "completed", stage: "elimination" },
    { tournament_id: tid, round: 1, match_number: 2, home_team_id: t[1].id, away_team_id: t[6].id, home_score: 3, away_score: 4, status: "completed", stage: "elimination" },
    { tournament_id: tid, round: 1, match_number: 3, home_team_id: t[2].id, away_team_id: t[5].id, home_score: 6, away_score: 3, status: "completed", stage: "elimination" },
    { tournament_id: tid, round: 1, match_number: 4, home_team_id: t[3].id, away_team_id: t[4].id, home_score: 2, away_score: 5, status: "completed", stage: "elimination" },
    { tournament_id: tid, round: 2, match_number: 5, home_team_id: t[0].id, away_team_id: t[6].id, home_score: 4, away_score: 2, status: "completed", stage: "elimination" },
    { tournament_id: tid, round: 2, match_number: 6, home_team_id: t[2].id, away_team_id: t[4].id, home_score: 3, away_score: 5, status: "completed", stage: "elimination" },
    { tournament_id: tid, round: 3, match_number: 7, home_team_id: t[0].id, away_team_id: t[4].id, home_score: 6, away_score: 4, status: "completed", stage: "elimination" },
  ]);
  console.log("✓ Žiemos Ledo Ritulio Taurė");
}

// 8. Kalėdinis Stalo Teniso Turnyras (round_robin, completed)
async function seedStaloTenisas() {
  const { tid, teams: t } = await getTeams("Kalėdinis Stalo Teniso Turnyras");
  const matches = [];
  let mn = 1;
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      let hs = Math.floor(Math.random() * 4);
      let as_ = Math.floor(Math.random() * 4);
      if (hs === as_) hs++;
      matches.push({
        tournament_id: tid, round: Math.ceil(mn / 8), match_number: mn,
        home_team_id: t[i].id, away_team_id: t[j].id,
        home_score: hs, away_score: as_,
        status: "completed", stage: "round_robin",
      });
      mn++;
    }
  }
  await insertMatches(matches);
  console.log("✓ Kalėdinis Stalo Teniso Turnyras");
}

// 9. Rudens Floorball Lyga (group_playoff, completed)
async function seedFloorball() {
  const { tid, teams: t } = await getTeams("Rudens Floorball Lyga");
  const gA = await createGroup(tid, "A grupė", [t[0].id, t[1].id, t[2].id, t[3].id]);
  const gB = await createGroup(tid, "B grupė", [t[4].id, t[5].id, t[6].id, t[7].id]);
  const gC = await createGroup(tid, "C grupė", [t[8].id, t[9].id, t[10].id, t[11].id]);

  await insertMatches([
    { tournament_id: tid, group_id: gA, round: 1, match_number: 1, home_team_id: t[0].id, away_team_id: t[1].id, home_score: 7, away_score: 3, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 1, match_number: 2, home_team_id: t[2].id, away_team_id: t[3].id, home_score: 5, away_score: 6, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 2, match_number: 3, home_team_id: t[0].id, away_team_id: t[2].id, home_score: 8, away_score: 4, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 2, match_number: 4, home_team_id: t[1].id, away_team_id: t[3].id, home_score: 4, away_score: 5, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 3, match_number: 5, home_team_id: t[0].id, away_team_id: t[3].id, home_score: 6, away_score: 3, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gA, round: 3, match_number: 6, home_team_id: t[1].id, away_team_id: t[2].id, home_score: 3, away_score: 7, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 1, match_number: 7, home_team_id: t[4].id, away_team_id: t[5].id, home_score: 5, away_score: 4, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 1, match_number: 8, home_team_id: t[6].id, away_team_id: t[7].id, home_score: 3, away_score: 6, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 2, match_number: 9, home_team_id: t[4].id, away_team_id: t[6].id, home_score: 7, away_score: 2, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 2, match_number: 10, home_team_id: t[5].id, away_team_id: t[7].id, home_score: 4, away_score: 4, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 3, match_number: 11, home_team_id: t[4].id, away_team_id: t[7].id, home_score: 8, away_score: 5, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gB, round: 3, match_number: 12, home_team_id: t[5].id, away_team_id: t[6].id, home_score: 6, away_score: 3, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 1, match_number: 13, home_team_id: t[8].id, away_team_id: t[9].id, home_score: 4, away_score: 5, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 1, match_number: 14, home_team_id: t[10].id, away_team_id: t[11].id, home_score: 6, away_score: 3, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 2, match_number: 15, home_team_id: t[8].id, away_team_id: t[10].id, home_score: 7, away_score: 7, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 2, match_number: 16, home_team_id: t[9].id, away_team_id: t[11].id, home_score: 5, away_score: 2, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 3, match_number: 17, home_team_id: t[8].id, away_team_id: t[11].id, home_score: 8, away_score: 4, status: "completed", stage: "group" },
    { tournament_id: tid, group_id: gC, round: 3, match_number: 18, home_team_id: t[9].id, away_team_id: t[10].id, home_score: 3, away_score: 6, status: "completed", stage: "group" },
    // Playoff
    { tournament_id: tid, round: 4, match_number: 19, home_team_id: t[0].id, away_team_id: t[5].id, home_score: 9, away_score: 5, status: "completed", stage: "playoff" },
    { tournament_id: tid, round: 4, match_number: 20, home_team_id: t[4].id, away_team_id: t[9].id, home_score: 7, away_score: 4, status: "completed", stage: "playoff" },
    { tournament_id: tid, round: 5, match_number: 21, home_team_id: t[0].id, away_team_id: t[4].id, home_score: 8, away_score: 6, status: "completed", stage: "playoff" },
  ]);
  console.log("✓ Rudens Floorball Lyga");
}

async function main() {
  console.log("Seeding matches...\n");
  await seedKrepsinisLyga();
  await seedFutsalCup();
  await seedVolleyball();
  await seedFutboloTaure();
  await seedRankinis();
  await seedBadmintonas();
  await seedLedoRitulys();
  await seedStaloTenisas();
  await seedFloorball();
  console.log("\n✅ All done!");
}

main().catch(console.error);
