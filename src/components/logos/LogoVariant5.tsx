// Variant 5: Dynamic trophy with flame/energy — sporty, energetic
export function LogoVariant5({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Energy burst behind cup */}
      <path d="M60 8l4 16-8 2 6 14-12-8 2 10-8-12 4 2-4-14 8-2L48 8l6 6z" fill="url(#gold5)" opacity="0.3" />
      {/* Cup body */}
      <path d="M40 30h40c-1 22-9 36-20 42-11-6-19-20-20-42z" fill="url(#gold5)" />
      {/* Left handle */}
      <path d="M40 34c-12 2-16 10-14 20s8 16 16 14" stroke="url(#gold5)" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Right handle */}
      <path d="M80 34c12 2 16 10 14 20s-8 16-16 14" stroke="url(#gold5)" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Rim highlight */}
      <path d="M42 30h36" stroke="#fff" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      {/* Inner shine */}
      <path d="M48 36h24c-1 14-5 24-12 30-7-6-11-16-12-30z" fill="#fff" opacity="0.1" />
      {/* Stem */}
      <rect x="55" y="72" width="10" height="12" rx="3" fill="url(#gold5)" />
      {/* Base */}
      <path d="M42 84h36l-2 6H44l-2-6z" fill="url(#gold5)" />
      {/* Spark accents */}
      <circle cx="32" cy="28" r="2" fill="url(#gold5)" opacity="0.5" />
      <circle cx="88" cy="28" r="2" fill="url(#gold5)" opacity="0.5" />
      <circle cx="26" cy="44" r="1.5" fill="url(#gold5)" opacity="0.3" />
      <circle cx="94" cy="44" r="1.5" fill="url(#gold5)" opacity="0.3" />
      {/* Text */}
      <text x="60" y="112" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="16" fill="currentColor" letterSpacing="-0.5">
        tur2tur
      </text>
      <defs>
        <linearGradient id="gold5" x1="60" y1="8" x2="60" y2="92" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE566" />
          <stop offset="0.3" stopColor="#FFD700" />
          <stop offset="0.7" stopColor="#FFA500" />
          <stop offset="1" stopColor="#CC7A00" />
        </linearGradient>
      </defs>
    </svg>
  );
}
