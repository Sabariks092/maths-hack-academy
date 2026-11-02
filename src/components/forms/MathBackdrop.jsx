// Decorative maths background for the standalone form pages:
// graph paper, scattered formulas/symbols and a few geometry outlines.

const glyphs = [
  { t: 'π', x: '6%', y: '12%', s: '4.5rem', r: -12, f: 'display' },
  { t: '√144 = 12', x: '72%', y: '8%', s: '1.9rem', r: 6, f: 'hand' },
  { t: '∑', x: '88%', y: '30%', s: '5rem', r: 10, f: 'display' },
  { t: 'a² + b² = c²', x: '4%', y: '38%', s: '1.8rem', r: -6, f: 'hand' },
  { t: '÷', x: '18%', y: '64%', s: '4rem', r: 0, f: 'display' },
  { t: '25 × 25 = 625', x: '74%', y: '58%', s: '1.8rem', r: -4, f: 'hand' },
  { t: '∞', x: '90%', y: '80%', s: '4.2rem', r: 0, f: 'display' },
  { t: '%', x: '40%', y: '4%', s: '3.2rem', r: 14, f: 'display' },
  { t: 'x = −b ± √(b²−4ac) / 2a', x: '8%', y: '88%', s: '1.6rem', r: 3, f: 'hand' },
  { t: '×', x: '58%', y: '90%', s: '3.6rem', r: 18, f: 'display' },
  { t: 'θ', x: '30%', y: '26%', s: '3rem', r: -8, f: 'display' },
  { t: '∫', x: '64%', y: '34%', s: '4.6rem', r: 8, f: 'display' },
  { t: '72 ÷ 8 = 9', x: '40%', y: '76%', s: '1.7rem', r: -3, f: 'hand' },
  { t: '+', x: '94%', y: '6%', s: '3rem', r: 0, f: 'display' },
  { t: 'Δ', x: '2%', y: '62%', s: '3.4rem', r: 6, f: 'display' },
]

export default function MathBackdrop() {
  return (
    <div aria-hidden="true" className="graph-paper pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none">
      {glyphs.map((g) => (
        <span
          key={g.t}
          className={`absolute whitespace-nowrap leading-none ${
            g.f === 'hand' ? 'font-hand text-teal/30' : 'font-display font-light text-ink/[0.09]'
          }`}
          style={{ left: g.x, top: g.y, fontSize: g.s, transform: `rotate(${g.r}deg)` }}
        >
          {g.t}
        </span>
      ))}

      {/* compass circle with radius */}
      <svg viewBox="0 0 200 200" className="absolute -top-16 -left-16 h-72 w-72 text-gold/30">
        <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 5" />
        <path d="M100 100 L170 62" stroke="currentColor" strokeWidth="1" />
        <circle cx="100" cy="100" r="3" fill="currentColor" />
      </svg>

      {/* right triangle with angle mark */}
      <svg viewBox="0 0 200 160" className="absolute right-[4%] bottom-[18%] h-44 w-56 text-teal/25">
        <path d="M10 150 L190 150 L10 20 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M10 130 h20 v20" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </svg>

      {/* cube outline from the logo */}
      <svg viewBox="0 0 100 112" className="absolute -right-24 -top-10 h-96 text-ink/[0.05]">
        <path d="M50 4 95 30v52l-45 26L5 82V30zM5 30l45 26 45-26M50 56v52" fill="none" stroke="currentColor" strokeWidth=".6" />
      </svg>

      {/* sine wave across the bottom */}
      <svg viewBox="0 0 800 80" preserveAspectRatio="none" className="absolute inset-x-0 bottom-10 h-20 w-full text-gold/25">
        <path
          d="M0 40 C50 0 100 0 150 40 S250 80 300 40 400 0 450 40 550 80 600 40 700 0 750 40 800 80 800 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    </div>
  )
}
