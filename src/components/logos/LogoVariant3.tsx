// Variant 3: Champions League inspired — rounded cup with big ears, stars above
export function LogoVariant3({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Three stars above */}
      <path d="M40 14l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L35 17.5l3.5-.5z" fill="url(#gold3)" />
      <path d="M60 10l2 4 4.5.5-3.5 3 1 4.5L60 19.5 56 22l1-4.5-3.5-3L58 14z" fill="url(#gold3)" />
      <path d="M80 14l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5L75 17.5l3.5-.5z" fill="url(#gold3)" />
      {/* Cup body — rounded bowl */}
      <ellipse cx="60" cy="42" rx="22" ry="18" fill="url(#gold3)" />
      <ellipse cx="60" cy="38" rx="18" ry="10" fill="#fff" opacity="0.12" />
      {/* Big left ear/handle */}
      <path d="M38 32c-16-2-22 8-20 18s10 18 22 16" stroke="url(#gold3)" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Big right ear/handle */}
      <path d="M82 32c16-2 22 8 20 18s-10 18-22 16" stroke="url(#gold3)" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Stem */}
      <rect x="56" y="60" width="8" height="18" rx="2" fill="url(#gold3)" />
      {/* Base plate */}
      <ellipse cx="60" cy="82" rx="18" ry="5" fill="url(#gold3)" />
      <ellipse cx="60" cy="80" rx="14" ry="3" fill="#fff" opacity="0.1" />
      {/* Text */}
      <text x="60" y="108" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="16" fill="currentColor" letterSpacing="-0.5">
        tur2tur
      </text>
      <defs>
        <linearGradient id="gold3" x1="60" y1="8" x2="60" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE14D" />
          <stop offset="0.4" stopColor="#FFB800" />
          <stop offset="1" stopColor="#B8860B" />
        </linearGradient>
      </defs>
    </svg>
  );
}
