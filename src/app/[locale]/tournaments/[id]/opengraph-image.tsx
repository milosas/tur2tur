import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Tournament on tur2tur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const formatLabels: Record<string, string> = {
  group_playoff: "Groups + Playoff",
  round_robin: "Round Robin",
  single_elimination: "Single Elimination",
  group_reclass: "Groups + Reclassification",
};

const statusColors: Record<string, string> = {
  draft: "#94a3b8",
  registration: "#3b82f6",
  in_progress: "#22c55e",
  completed: "#a855f7",
};

export default async function TournamentOGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let name = "Tournament";
  let format = "";
  let status = "draft";

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from("tournaments")
        .select("name, format, status")
        .eq("id", id)
        .single();

      if (data) {
        name = data.name;
        format = data.format;
        status = data.status;
      }
    }
  } catch {
    // Fallback to defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* tur2tur brand */}
        <div
          style={{
            position: "absolute",
            top: "32px",
            left: "40px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              color: "white",
              fontWeight: 700,
            }}
          >
            T2T
          </div>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#64748b" }}>
            tur2tur
          </span>
        </div>

        {/* Status badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: statusColors[status] || "#94a3b8",
            }}
          />
          <span
            style={{
              fontSize: "18px",
              color: statusColors[status] || "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 600,
            }}
          >
            {status.replace("_", " ")}
          </span>
        </div>

        {/* Tournament name */}
        <div
          style={{
            fontSize: name.length > 30 ? "42px" : "52px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.2,
          }}
        >
          {name}
        </div>

        {/* Format */}
        {format && (
          <div
            style={{
              fontSize: "22px",
              color: "#94a3b8",
              marginTop: "20px",
            }}
          >
            {formatLabels[format] || format}
          </div>
        )}

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            color: "#475569",
            fontSize: "18px",
          }}
        >
          tur2tur.com
        </div>
      </div>
    ),
    { ...size }
  );
}
