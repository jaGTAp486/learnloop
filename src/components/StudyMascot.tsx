type MascotMood = 'welcome' | 'studying' | 'celebrate' | 'encourage' | 'resting';

type StudyMascotProps = {
  mood?: MascotMood;
  size?: number;
  className?: string;
};

const moodMessages: Record<MascotMood, string> = {
  welcome: "Welcome back to your little study space. Let's make today count!",
  studying: "Focus mode on. I'm right here studying with you.",
  celebrate: "You did it! Every completed task brings you closer to mastery.",
  encourage: "You're making progress. Keep going — you've got this!",
  resting: "Time for a well-earned break. Rest is part of learning too.",
};

/** Original cartoon study mascot — a friendly boy in an oversized hoodie
 *  with headphones. SVG-only, lightweight, no external assets. */
export function StudyMascot({ mood = 'welcome', size = 120, className }: StudyMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Soft glow behind mascot */}
      <circle cx="60" cy="60" r="55" fill="#151D30" />
      <circle cx="60" cy="60" r="55" fill="url(#mascot-glow)" />

      <defs>
        <radialGradient id="mascot-glow" cx="0.5" cy="0.4" r="0.5">
          <stop stopColor="#F6D7A7" stopOpacity="0.08" />
          <stop offset="1" stopColor="#F6D7A7" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hoodie-grad" x1="30" y1="60" x2="90" y2="105" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5a37b8" />
          <stop offset="1" stopColor="#4a2c9e" />
        </linearGradient>
        <linearGradient id="hoodie-light" x1="30" y1="60" x2="60" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7e57e0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#5a37b8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* === Body / Hoodie === */}
      <path d="M28 105 C28 82, 40 70, 60 70 C80 70, 92 82, 92 105 L92 120 L28 120 Z" fill="url(#hoodie-grad)" />
      <path d="M28 105 C28 82, 40 70, 60 70 C72 70, 82 75, 87 85 L80 90 C75 80, 68 76, 60 76 C44 76, 34 86, 34 105 Z" fill="url(#hoodie-light)" />
      {/* Hood collar */}
      <path d="M42 72 C42 65, 50 60, 60 60 C70 60, 78 65, 78 72 L78 76 C78 76, 70 72, 60 72 C50 72, 42 76, 42 76 Z" fill="#4a2c9e" />

      {/* Laptop (only for studying mood) */}
      {mood === 'studying' && (
        <g>
          <rect x="44" y="92" width="32" height="18" rx="2" fill="#2A3450" />
          <rect x="46" y="94" width="28" height="13" rx="1" fill="#1E2840" />
          <rect x="48" y="96" width="10" height="2" rx="0.5" fill="#78E5F5" opacity="0.6" />
          <rect x="48" y="100" width="16" height="1.5" rx="0.5" fill="#5C6B82" />
          <rect x="48" y="103" width="12" height="1.5" rx="0.5" fill="#5C6B82" />
        </g>
      )}

      {/* === Head === */}
      <circle cx="60" cy="46" r="20" fill="#F0C885" />
      {/* Hair — messy fringe */}
      <path d="M40 42 C40 32, 48 26, 60 26 C72 26, 80 32, 80 42 C80 38, 76 34, 70 34 C68 30, 64 28, 60 28 C56 28, 52 30, 50 34 C44 34, 40 38, 40 42 Z" fill="#3A2D1E" />
      <path d="M42 40 C44 36, 48 34, 52 35 C50 33, 46 33, 44 36 Z" fill="#2D2014" />

      {/* === Headphones === */}
      {/* Headband */}
      <path d="M38 40 C38 28, 48 22, 60 22 C72 22, 82 28, 82 40" stroke="#2A3450" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M38 40 C38 28, 48 22, 60 22 C72 22, 82 28, 82 40" stroke="#3A4660" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Left ear cup */}
      <ellipse cx="38" cy="46" rx="6" ry="8" fill="#2A3450" />
      <ellipse cx="38" cy="46" rx="4" ry="6" fill="#1E2840" />
      <circle cx="38" cy="46" r="2" fill="#78E5F5" opacity="0.7" />
      {/* Right ear cup */}
      <ellipse cx="82" cy="46" rx="6" ry="8" fill="#2A3450" />
      <ellipse cx="82" cy="46" rx="4" ry="6" fill="#1E2840" />
      <circle cx="82" cy="46" r="2" fill="#78E5F5" opacity="0.7" />

      {/* === Face — mood-based === */}
      {mood === 'welcome' && (
        <>
          {/* Happy eyes — gentle arcs */}
          <path d="M50 48 C52 46, 54 46, 56 48" stroke="#3A2D1E" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M64 48 C66 46, 68 46, 70 48" stroke="#3A2D1E" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Warm smile */}
          <path d="M54 54 C56 57, 64 57, 66 54" stroke="#3A2D1E" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Blush */}
          <circle cx="48" cy="52" r="3" fill="#F6D7A7" opacity="0.4" />
          <circle cx="72" cy="52" r="3" fill="#F6D7A7" opacity="0.4" />
        </>
      )}

      {mood === 'studying' && (
        <>
          {/* Focused eyes — small dots looking down */}
          <circle cx="53" cy="49" r="1.8" fill="#3A2D1E" />
          <circle cx="67" cy="49" r="1.8" fill="#3A2D1E" />
          {/* Slight concentrated mouth */}
          <path d="M55 56 L65 56" stroke="#3A2D1E" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}

      {mood === 'celebrate' && (
        <>
          {/* Sparkle eyes — stars */}
          <path d="M53 45 L53 51 M50 48 L56 48 M51 46 L55 50 M55 46 L51 50" stroke="#78E5F5" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M67 45 L67 51 M64 48 L70 48 M65 46 L69 50 M69 46 L65 50" stroke="#78E5F5" strokeWidth="1.5" strokeLinecap="round" />
          {/* Big smile */}
          <path d="M52 53 C55 58, 65 58, 68 53" stroke="#3A2D1E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* Sparkles around */}
          <circle cx="34" cy="36" r="1.5" fill="#F6D7A7" opacity="0.8" />
          <circle cx="86" cy="34" r="1.5" fill="#B9A5FF" opacity="0.8" />
          <circle cx="88" cy="60" r="1" fill="#78E5F5" opacity="0.6" />
        </>
      )}

      {mood === 'encourage' && (
        <>
          {/* Determined eyes — small circles */}
          <circle cx="53" cy="48" r="2" fill="#3A2D1E" />
          <circle cx="67" cy="48" r="2" fill="#3A2D1E" />
          {/* Encouraging smile */}
          <path d="M54 54 C57 57, 63 57, 66 54" stroke="#3A2D1E" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Thumbs up */}
          <circle cx="88" cy="88" r="4" fill="#F0C885" />
        </>
      )}

      {mood === 'resting' && (
        <>
          {/* Closed eyes — relaxed arcs */}
          <path d="M50 49 C52 50, 54 50, 56 49" stroke="#3A2D1E" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M64 49 C66 50, 68 50, 70 49" stroke="#3A2D1E" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Peaceful smile */}
          <path d="M55 55 C57 57, 63 57, 65 55" stroke="#3A2D1E" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Zzz */}
          <text x="82" y="32" fill="#B9A5FF" fontSize="8" fontFamily="sans-serif" opacity="0.7">z</text>
          <text x="86" y="26" fill="#B9A5FF" fontSize="6" fontFamily="sans-serif" opacity="0.5">z</text>
        </>
      )}
    </svg>
  );
}

export { moodMessages };
export type { MascotMood };
