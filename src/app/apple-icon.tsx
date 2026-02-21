import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          borderRadius: "36px",
          fontFamily: "sans-serif",
        }}
      >
        <span
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "white",
            letterSpacing: "-3px",
            lineHeight: 1,
          }}
        >
          T2T
        </span>
      </div>
    ),
    { ...size }
  );
}
