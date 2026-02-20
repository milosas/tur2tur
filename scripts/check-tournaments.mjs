import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const { data, error } = await supabase.from("tournaments").select("id, name, format, status");
console.log("Error:", error);
console.log("Tournaments:", data?.length);
data?.forEach(t => console.log(`  ${t.name} (${t.format}, ${t.status})`));
