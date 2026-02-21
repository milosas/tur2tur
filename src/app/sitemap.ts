import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://tur2tur.com";
const locales = ["lt", "lv", "ee", "en"];

const staticPages = [
  "",
  "/tournaments",
  "/pricing",
  "/formats",
  "/about",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const page of staticPages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : 0.7,
      });
    }
  }

  // Dynamic tournament pages
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: tournaments } = await supabase
        .from("tournaments")
        .select("id, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(500);

      if (tournaments) {
        for (const tournament of tournaments) {
          for (const locale of locales) {
            entries.push({
              url: `${BASE_URL}/${locale}/tournaments/${tournament.id}`,
              lastModified: new Date(tournament.created_at),
              changeFrequency: "daily",
              priority: 0.8,
            });
          }
        }
      }
    }
  } catch {
    // Sitemap still works without dynamic tournaments
  }

  return entries;
}
