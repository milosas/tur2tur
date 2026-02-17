// Variant 2: Modern geometric trophy — angular, bold, sporty feel
export function LogoVariant2({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield-shaped cup body */}
      <path d="M36 22h48l-6 48H42L36 22z" fill="url(#gold2)" />
      {/* Left wing handle */}
      <path d="M36 28L18 36l10 20 8-4" fill="url(#gold2)" opacity="0.7" />
      {/* Right wing handle */}
      <path d="M84 28l18 8-10 20-8-4" fill="url(#gold2)" opacity="0.7" />
      {/* Inner cutout / shine */}
      <path d="M46 30h28l-4 34H50L46 30z" fill="#fff" opacity="0.15" />
      {/* Stem */}
      <rect x="54" y="70" width="12" height="12" rx="2" fill="url(#gold2)" />
      {/* Wide base */}
      <path d="M40 82h40l-4 8H44l-4-8z" fill="url(#gold2)" />
      {/* Number 2 accent */}
      <text x="60" y="58" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="22" fill="#fff" opacity="0.9">
        2
      </text>
      {/* Text */}
      <text x="60" y="112" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="16" fill="currentColor" letterSpacing="-0.5">
        tur2tur
      </text>
      <defs>
        <linearGradient id="gold2" x1="60" y1="18" x2="60" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9D423" />
          <stop offset="0.5" stopColor="#F5A623" />
          <stop offset="1" stopColor="#CF8B00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
