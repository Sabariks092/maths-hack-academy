// Vector redraw of the Math Hacks "MH" cube logo from the posters.
export function LogoMark({ className = '', tone = 'dark' }) {
  const ink = tone === 'dark' ? '#16150F' : '#F7F1E3'
  const gold = '#C8912A'
  return (
    <svg viewBox="0 0 100 112" className={className} aria-hidden="true">
      <g fill="none" strokeWidth="5" strokeLinejoin="miter">
        <path d="M50 4 L5 30 L5 82 L50 108" stroke={ink} />
        <path d="M50 4 L95 30 L95 82 L50 108" stroke={gold} />
        <path d="M5 30 L50 56" stroke={ink} />
        <path d="M50 56 L95 30" stroke={gold} />
        <polygon points="50,15.4 75.2,30 50,44.6 24.8,30" stroke={gold} strokeWidth="4.5" />
      </g>
      <polygon points="50,24.3 59.9,30 50,35.7 40.1,30" fill={gold} />
      <g transform="matrix(1 0.578 0 1 5 30)">
        <path transform="translate(6 7) scale(1.18)" fill={ink} d="M0 32V0h7l7 12 7-12h7v32h-7V14l-7 11-7-11v18z" />
      </g>
      <g transform="matrix(1 -0.578 0 1 50 56)">
        <path transform="translate(7 6) scale(1.2)" fill={gold} d="M0 0h7v12.5h12V0h7v32h-7V19.5H7V32H0z" />
      </g>
    </svg>
  )
}

export function Brand({ tone = 'dark', className = '' }) {
  const light = tone === 'light'
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark tone={tone} className="h-10 w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span className={`text-[1.05rem] font-extrabold tracking-[0.08em] ${light ? 'text-paper' : 'text-ink'}`}>
          MATH <span className="text-gold">HACKS</span>
        </span>
        <span
          className={`mt-1.5 flex items-center gap-1.5 text-[0.56rem] font-semibold tracking-[0.2em] uppercase ${
            light ? 'text-paper/70' : 'text-muted'
          }`}
        >
          <span className="h-px w-2.5 bg-gold" />
          Smart way to success
          <span className="h-px w-2.5 bg-gold" />
        </span>
      </span>
    </span>
  )
}
