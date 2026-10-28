type LearnLoopLogoProps = {
  size?: number;
  className?: string;
};

/**
 * LearnLoop brand mark — a circular loop with a neon cyan-to-purple gradient,
 * representing continuous learning cycles. Two interlocking arcs form an
 * infinite loop with a subtle node/spark at the intersection.
 */
export function LearnLoopMark({ size = 36, className }: LearnLoopLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ll-grad-cyan" x1="8" y1="8" x2="32" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="ll-grad-purple" x1="56" y1="56" x2="32" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a855f7" />
          <stop offset="1" stopColor="#7e22ce" />
        </linearGradient>
      </defs>
      {/* Rounded square background — dark navy */}
      <rect width="64" height="64" rx="16" fill="#0b111e" />
      <rect width="64" height="64" rx="16" fill="url(#ll-grad-cyan)" fillOpacity="0.08" />
      {/* Left arc (cyan) — represents the learning half of the loop */}
      <path
        d="M32 12C20 12 12 20 12 32C12 44 20 52 32 52"
        stroke="url(#ll-grad-cyan)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right arc (purple) — represents the mastery half of the loop */}
      <path
        d="M32 52C44 52 52 44 52 32C52 20 44 12 32 12"
        stroke="url(#ll-grad-purple)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center node — the learning spark */}
      <circle cx="32" cy="32" r="5" fill="url(#ll-grad-cyan)" />
      <circle cx="32" cy="32" r="2.5" fill="#0b111e" />
      {/* Top connection dot */}
      <circle cx="32" cy="12" r="2.5" fill="#22d3ee" />
      {/* Bottom connection dot */}
      <circle cx="32" cy="52" r="2.5" fill="#a855f7" />
    </svg>
  );
}

/** Full logo: mark + wordmark side by side */
export function LearnLoopLogo({
  size = 36,
  showText = true,
  className,
}: LearnLoopLogoProps & { showText?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ''}`}>
      <LearnLoopMark size={size} />
      {showText && (
        <div className="leading-tight">
          <div className="font-display font-bold text-white">
            LearnLoop
          </div>
          <div className="text-[11px] text-neon-300/70 leading-tight">
            Learn together. Master every loop.
          </div>
        </div>
      )}
    </div>
  );
}
