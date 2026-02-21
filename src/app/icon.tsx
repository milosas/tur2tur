import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          borderRadius: "6px",
          fontFamily: "sans-serif",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            fontWeight: 900,
            color: "white",
            letterSpacing: "-1px",
          }}
        >
          T
        </span>
      </div>
    ),
    { ...size }
  );
}
