// Variant 1: Classic trophy cup with "tur2tur" — clean, symmetric, gold accent
export function LogoVariant1({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trophy cup body */}
      <path d="M40 25h40v5c0 18-8 32-20 38-12-6-20-20-20-38V25z" fill="url(#gold1)" />
      {/* Left handle */}
      <path d="M40 30c-12 0-18 8-18 18s6 18 18 18" stroke="url(#gold1)" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Right handle */}
      <path d="M80 30c12 0 18 8 18 18s-6 18-18 18" stroke="url(#gold1)" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Stem */}
      <rect x="56" y="68" width="8" height="16" rx="2" fill="url(#gold1)" />
      {/* Base */}
      <rect x="42" y="84" width="36" height="6" rx="3" fill="url(#gold1)" />
      <rect x="46" y="90" width="28" height="4" rx="2" fill="url(#gold1)" opacity="0.7" />
      {/* Star on cup */}
      <path d="M60 36l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#fff" opacity="0.9" />
      {/* Text */}
      <text x="60" y="112" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="16" fill="currentColor" letterSpacing="-0.5">
        tur2tur
      </text>
      <defs>
        <linearGradient id="gold1" x1="60" y1="20" x2="60" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD700" />
          <stop offset="0.5" stopColor="#FFA500" />
          <stop offset="1" stopColor="#B8860B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
