export function CafeMark({ className = 'h-10 w-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M8 62 L28 34 L38 46 L52 22 L74 62 Z"
        stroke="url(#mark-gold)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M52 22 L60 34 L48 34 Z" fill="url(#mark-gold)" opacity="0.9" />
      <path d="M16 46 Q19 41 22 46 Q19 43.5 16 46 Z" fill="url(#mark-gold)" />
      <path d="M78 40 Q82 34 86 40 Q82 37 78 40 Z" fill="url(#mark-gold)" />
      <line x1="4" y1="66" x2="80" y2="66" stroke="url(#mark-gold)" strokeWidth="1" opacity="0.6" />
      <defs>
        <linearGradient id="mark-gold" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e6cd7e" />
          <stop offset="50%" stopColor="#c9a227" />
          <stop offset="100%" stopColor="#7d5f17" />
        </linearGradient>
      </defs>
    </svg>
  );
}
