'use client'

export function KidsRobot({ className = '', waving = false }: { className?: string; waving?: boolean }) {
  return (
    <div className={`relative select-none ${className}`} aria-hidden>
      <svg viewBox="0 0 120 140" className="h-full w-full drop-shadow-md" fill="none">
        <ellipse cx="60" cy="128" rx="28" ry="6" fill="#000" opacity="0.08" />
        <rect x="38" y="95" width="44" height="32" rx="14" fill="#ffffff" stroke="#93C5FD" strokeWidth="3" />
        <rect x="48" y="108" width="24" height="10" rx="5" fill="#BFDBFE" />
        <rect x="28" y="72" width="64" height="58" rx="22" fill="#ffffff" stroke="#93C5FD" strokeWidth="3" />
        <circle cx="46" cy="92" r="7" fill="#1E40AF" />
        <circle cx="74" cy="92" r="7" fill="#1E40AF" />
        <circle cx="48" cy="90" r="2.5" fill="#ffffff" />
        <circle cx="76" cy="90" r="2.5" fill="#ffffff" />
        <path d="M52 104 Q60 110 68 104" stroke="#1E40AF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <rect x="44" y="48" width="32" height="24" rx="10" fill="#3B82F6" />
        <circle cx="60" cy="38" r="10" fill="#FBBF24" />
        <rect x="54" y="28" width="12" height="8" rx="4" fill="#FBBF24" />
        <g className={waving ? 'origin-[88px_78px] animate-[kids-wave_1.2s_ease-in-out_infinite]' : ''}>
          <rect x="88" y="72" width="18" height="12" rx="6" fill="#ffffff" stroke="#93C5FD" strokeWidth="3" />
        </g>
        <rect x="14" y="72" width="18" height="12" rx="6" fill="#ffffff" stroke="#93C5FD" strokeWidth="3" />
      </svg>
    </div>
  )
}

export function KidsLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center gap-2 font-black text-[#2563EB] ${compact ? 'text-lg' : 'text-xl'}`}>
      <svg viewBox="0 0 32 32" className={compact ? 'h-7 w-7' : 'h-8 w-8'} aria-hidden>
        <path
          d="M16 2L19 11H29L21 17L24 27L16 21L8 27L11 17L3 11H13L16 2Z"
          fill="#3B82F6"
          stroke="#2563EB"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <span>ByteKids</span>
    </div>
  )
}
