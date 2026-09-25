interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showWordmark = true, className = '' }: LogoProps) {
  const dimensionMap = {
    sm: { iconSize: 28, textClass: 'text-base', boxClass: 'h-7 w-7 rounded-lg' },
    md: { iconSize: 36, textClass: 'text-lg', boxClass: 'h-9 w-9 rounded-xl' },
    lg: { iconSize: 48, textClass: 'text-2xl', boxClass: 'h-12 w-12 rounded-2xl' },
  };

  const { iconSize, textClass } = dimensionMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SVG Monogram Icon (Concept 2 - Interlocking 'oB') */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="onboard-brand-grad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8B5CF6" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Outer Dark Container Box */}
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="9"
          fill="#09090B"
          stroke="#27272A"
          strokeWidth="1.5"
        />

        {/* Ambient Subtle Background Accent */}
        <rect
          x="4"
          y="4"
          width="28"
          height="28"
          rx="7"
          fill="url(#onboard-brand-grad)"
          fillOpacity="0.08"
        />

        {/* 'o' Outer Continuous Geometric Loop with Glow */}
        <path
          d="M8.5 18C8.5 12.7533 12.7533 8.5 18 8.5C23.2467 8.5 27.5 12.7533 27.5 18C27.5 23.2467 23.2467 27.5 18 27.5C12.7533 27.5 8.5 23.2467 8.5 18Z"
          stroke="url(#onboard-brand-grad)"
          strokeWidth="2.5"
          filter="url(#glow)"
        />

        {/* 'B' Crisp Geometric Blocks */}
        <path
          d="M17 12V24M17 12H21.5C22.8807 12 24 13.1193 24 14.5C24 15.8807 22.8807 17 21.5 17M17 17H22C23.3807 17 24.5 18.1193 24.5 19.5C24.5 20.8807 23.3807 22 22 22H17"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Pulse Dot */}
        <circle cx="21" cy="18" r="1.2" fill="#06B6D4" />
      </svg>

      {/* Styled Wordmark */}
      {showWordmark && (
        <span className={`font-bold tracking-tight text-zinc-100 flex items-center ${textClass}`}>
          on<span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">Board</span>
        </span>
      )}
    </div>
  );
}
