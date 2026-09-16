export function VoiceOrb({ active, speaking }: { active: boolean; speaking: boolean }) {
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      {active && (
        <>
          <span className="absolute inset-0 rounded-full bg-brand-400/40 animate-pulseRing" />
          <span
            className="absolute inset-0 rounded-full bg-brand-400/40 animate-pulseRing"
            style={{ animationDelay: "0.6s" }}
          />
        </>
      )}
      <div
        className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-lg transition-transform ${
          speaking ? "scale-105 bg-brand-500" : "bg-brand-400"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-11 w-11 text-white">
          <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
          <path
            d="M5 11a7 7 0 0 0 14 0M12 18v3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
