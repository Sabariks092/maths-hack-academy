import { useEffect, useState } from 'react'

// 48 × 12 worked with the Vedic "vertically and crosswise" method.
const steps = [
  { note: 'Vertically: 8 × 2 = 16', detail: 'write 6, carry 1', lines: [[140, 32, 140, 96]] },
  {
    note: 'Crosswise: 4×2 + 8×1 = 16',
    detail: '+ carry 1 = 17 → write 7, carry 1',
    lines: [
      [84, 32, 140, 96],
      [140, 32, 84, 96],
    ],
  },
  { note: 'Vertically: 4 × 1 = 4', detail: '+ carry 1 = 5', lines: [[84, 32, 84, 96]] },
]
const answer = ['5', '7', '6'] // revealed right-to-left, one digit per step

export default function CrosswiseSlip({ className = '' }) {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [step, setStep] = useState(reduced ? 2 : 0)

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setStep((s) => (s + 1) % 4), 2400)
    return () => clearInterval(id)
  }, [reduced])

  const active = Math.min(step, 2)
  const shown = (col) => step === 3 || 2 - col <= step

  return (
    <figure
      className={`ruled-paper w-[18.5rem] -rotate-2 px-6 pt-5 pb-6 shadow-[0_1px_0_rgb(22_21_15/0.08),0_24px_48px_-24px_rgb(22_21_15/0.35)] ${className}`}
      aria-label="48 times 12 equals 576, worked in one line using the vertically and crosswise method"
    >
      <div className="flex items-center justify-between text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted">
        <span>Vertically &amp; crosswise</span>
        <span className="font-display text-xs normal-case italic tracking-normal text-gold">
          step {active + 1}/3
        </span>
      </div>

      <div className="relative mx-auto mt-4 w-[10.5rem] font-display text-[2.6rem] font-light leading-none">
        <svg viewBox="0 0 168 128" className="absolute inset-x-0 top-0 h-32 w-full" aria-hidden="true">
          {steps[active].lines.map(([x1, y1, x2, y2], i) => (
            <line
              key={`${active}-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--color-gold-bright)"
              strokeWidth="9"
              strokeLinecap="round"
              opacity=".55"
              className="animate-fade-up"
            />
          ))}
        </svg>
        <div className="relative grid h-16 grid-cols-3 place-items-center">
          <span />
          <span>4</span>
          <span>8</span>
        </div>
        <div className="relative grid h-16 grid-cols-3 place-items-center">
          <span className="text-2xl text-muted">×</span>
          <span>1</span>
          <span>2</span>
        </div>
        <div className="h-px bg-ink" />
        <div className="grid h-16 grid-cols-3 place-items-center text-teal">
          {answer.map((d, col) => (
            <span key={col} className={`transition-all duration-500 ${shown(col) ? 'opacity-100' : 'translate-y-1 opacity-0'}`}>
              {d}
            </span>
          ))}
        </div>
      </div>

      <figcaption key={active} className="animate-fade-up mt-2 border-t border-dashed border-ink/20 pt-3 font-hand text-[1.35rem] leading-tight text-ink-soft">
        {steps[active].note}
        <span className="block text-lg text-muted">{steps[active].detail}</span>
      </figcaption>
    </figure>
  )
}
