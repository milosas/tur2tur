import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get all tournaments
const { data: tournaments } = await supabase
  .from("tournaments")
  .select("id, name, created_at")
  .order("name")
  .order("created_at", { ascending: true });

// Group by name, keep only the first (oldest) of each
const seen = new Map();
const toDelete = [];

for (const t of tournaments) {
  if (seen.has(t.name)) {
    toDelete.push(t.id);
  } else {
    seen.set(t.name, t.id);
  }
}

console.log(`Found ${toDelete.length} duplicates to delete`);

for (const id of toDelete) {
  // Delete matches, groups, teams first (foreign keys)
  await supabase.from("matches").delete().eq("tournament_id", id);
  await supabase.from("tournament_groups").delete().eq("tournament_id", id);
  await supabase.from("teams").delete().eq("tournament_id", id);
  await supabase.from("tournaments").delete().eq("id", id);
}

// Also clean any existing matches/groups from the remaining tournaments (we'll re-seed)
const keepIds = [...seen.values()];
for (const id of keepIds) {
  await supabase.from("matches").delete().eq("tournament_id", id);
  await supabase.from("tournament_groups").delete().eq("tournament_id", id);
}

// Verify
const { data: remaining } = await supabase.from("tournaments").select("id, name");
console.log(`\nRemaining tournaments: ${remaining.length}`);
remaining.forEach(t => console.log(`  ${t.name}`));
