export function SkylineSilhouette({ className = 'w-full h-16' }: { className?: string }) {
  return (
    <svg viewBox="0 0 1200 100" className={className} preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0,100 L0,70 L30,70 L30,50 L45,50 L45,65 L70,65 L70,40 L90,40 L90,60 L110,60 L110,30 L130,30 L130,55 L160,55 L160,20 L175,20 L175,15 L190,15 L190,20 L205,20 L205,55 L230,55 L230,45 L250,45 L250,60 L280,60 L280,35 L300,35 L300,50 L330,50 L330,25 L345,25 L345,10 L360,10 L360,25 L375,25 L375,50 L410,50 L410,65 L440,65 L440,40 L460,40 L460,55 L490,55 L490,30 L510,30 L510,20 L525,20 L525,30 L545,30 L545,55 L580,55 L580,45 L600,45 L600,60 L630,60 L630,35 L650,35 L650,50 L680,50 L680,25 L700,25 L700,15 L715,15 L715,25 L735,25 L735,50 L770,50 L770,65 L800,65 L800,40 L820,40 L820,55 L850,55 L850,30 L870,30 L870,20 L885,20 L885,30 L905,30 L905,55 L940,55 L940,45 L960,45 L960,60 L990,60 L990,35 L1010,35 L1010,50 L1040,50 L1040,25 L1055,25 L1055,10 L1070,10 L1070,25 L1085,25 L1085,50 L1120,50 L1120,65 L1150,65 L1150,40 L1170,40 L1170,60 L1200,60 L1200,100 Z"
        fill="url(#skyline-gold)"
        opacity="0.22"
      />
      <defs>
        <linearGradient id="skyline-gold" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c9a227" />
          <stop offset="50%" stopColor="#e6cd7e" />
          <stop offset="100%" stopColor="#c9a227" />
        </linearGradient>
      </defs>
    </svg>
  );
}
