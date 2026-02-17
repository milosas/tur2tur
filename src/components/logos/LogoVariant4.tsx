// Variant 4: Minimal flat trophy — clean lines, modern SaaS style
export function LogoVariant4({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cup body — simple trapezoid */}
      <path d="M38 24h44v4c0 20-9 34-22 40-13-6-22-20-22-40V24z" fill="url(#gold4)" />
      {/* Left handle — thin arc */}
      <path d="M38 30c-10 0-14 7-14 14s4 14 14 14" stroke="url(#gold4)" strokeWidth="3" fill="none" />
      {/* Right handle — thin arc */}
      <path d="M82 30c10 0 14 7 14 14s-4 14-14 14" stroke="url(#gold4)" strokeWidth="3" fill="none" />
      {/* Thin stem */}
      <rect x="57" y="68" width="6" height="14" rx="3" fill="url(#gold4)" />
      {/* Flat base */}
      <rect x="44" y="82" width="32" height="5" rx="2.5" fill="url(#gold4)" />
      {/* "2" in the center of the cup */}
      <text x="60" y="52" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="26" fill="#fff" opacity="0.85">
        2
      </text>
      {/* Text */}
      <text x="60" y="110" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="16" fill="currentColor" letterSpacing="-0.5">
        tur2tur
      </text>
      <defs>
        <linearGradient id="gold4" x1="60" y1="20" x2="60" y2="90" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD700" />
          <stop offset="1" stopColor="#E8A800" />
        </linearGradient>
      </defs>
    </svg>
  );
}
