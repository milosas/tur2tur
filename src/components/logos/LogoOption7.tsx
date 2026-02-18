export function LogoOption7({ className, size = 200 }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 200 60" width={size} className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo7-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="logo7-silver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id="logo7-bronze" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
      </defs>

      {/* Podium — centered vertically */}
      <g transform="translate(10, 6)">
        {/* 3rd place - left */}
        <rect x="0" y="30" width="14" height="18" fill="url(#logo7-bronze)" rx="1.5" />
        <text x="7" y="42" fontFamily="system-ui" fontSize="10" fontWeight="700" fill="#fff" textAnchor="middle">3</text>

        {/* 1st place - center (tallest) */}
        <rect x="16" y="14" width="14" height="34" fill="url(#logo7-gold)" rx="1.5" />
        <text x="23" y="28" fontFamily="system-ui" fontSize="10" fontWeight="700" fill="#fff" textAnchor="middle">1</text>

        {/* 2nd place - right */}
        <rect x="32" y="22" width="14" height="26" fill="url(#logo7-silver)" rx="1.5" />
        <text x="39" y="38" fontFamily="system-ui" fontSize="10" fontWeight="700" fill="#fff" textAnchor="middle">2</text>

        {/* Trophy on 1st place */}
        <g transform="translate(23, 6)">
          <circle cx="0" cy="0" r="3.5" fill="#fbbf24" />
          <path d="M -2.5 0 L -3 5 L 3 5 L 2.5 0 Z" fill="#fbbf24" />
        </g>
      </g>

      {/* Decorative star */}
      <path d="M 58 10 L 59.5 14 L 63.5 14 L 60.5 16.5 L 61.5 20 L 58 17.5 L 54.5 20 L 55.5 16.5 L 52.5 14 L 56.5 14 Z" fill="#d97706" opacity="0.4" />

      {/* "tur2tur" text — vertically centered with podium */}
      <text
        x="65"
        y="33"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="28"
        fontWeight="700"
        fill="#0284c7"
        letterSpacing="-1"
        dominantBaseline="central"
      >
        tur2tur
      </text>
    </svg>
  );
}
