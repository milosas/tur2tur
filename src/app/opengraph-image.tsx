import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "tur2tur — Baltic Tournament Planner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              color: "white",
              fontWeight: 700,
            }}
          >
            T2T
          </div>
          <span
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            tur2tur
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Baltic Tournament Planner
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "48px",
          }}
        >
          {["Groups", "Playoffs", "Live Scores"].map((feature) => (
            <div
              key={feature}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#e2e8f0",
                fontSize: "20px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#3b82f6",
                }}
              />
              {feature}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            color: "#64748b",
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
