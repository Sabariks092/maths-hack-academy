import { useState } from 'react'

const options = [15, 25, 35, 45, 55, 65, 75, 85, 95]

// Vedic sutra "Ekādhikena Pūrvena" — by one more than the one before.
export default function SquareTrick() {
  const [n, setN] = useState(25)
  const a = (n - 5) / 10
  const head = a * (a + 1)

  return (
    <div className="grid border-y border-ink/15 md:grid-cols-12">
      <div className="py-10 md:col-span-5 md:border-r md:border-ink/15 md:py-14 md:pr-10">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted">Try one yourself</p>
        <h3 className="mt-3 font-display text-[1.75rem] leading-tight font-light">
          Square any number ending in <em className="text-gold italic">5</em> — in your head.
        </h3>

        <div className="mt-7 flex flex-wrap gap-2" role="radiogroup" aria-label="Pick a number to square">
          {options.map((value) => {
            const selected = value === n
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setN(value)}
                className={`h-11 w-12 border font-display text-lg transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                  selected ? 'border-ink bg-ink text-paper' : 'border-ink/20 hover:border-ink'
                }`}
              >
                {value}
              </button>
            )
          })}
        </div>

        <ol className="mt-8 space-y-4 text-[0.95rem] leading-relaxed text-ink-soft">
          <li className="flex gap-4">
            <span className="font-display italic text-gold">i.</span>
            <span>
              Take the digit before the 5: <strong className="font-semibold text-ink">{a}</strong>.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="font-display italic text-gold">ii.</span>
            <span>
              Multiply it by one more than itself: {a} × {a + 1} = <strong className="font-semibold text-ink">{head}</strong>.
            </span>
          </li>
          <li className="flex gap-4">
            <span className="font-display italic text-gold">iii.</span>
            <span>
              Write <strong className="font-semibold text-ink">25</strong> after it. That&apos;s the answer.
            </span>
          </li>
        </ol>
      </div>

      <div className="graph-paper relative flex min-h-[18rem] flex-col justify-center overflow-hidden px-6 py-12 md:col-span-7 md:px-12">
        <p className="font-hand text-2xl text-teal">
          {n}² = {a} × {a + 1} | 25
        </p>
        <p
          key={n}
          className="animate-fade-up mt-2 font-display text-[clamp(3.5rem,10vw,7.5rem)] leading-none font-light tracking-[-0.03em]"
          aria-live="polite"
        >
          <span className="sr-only">
            {n} squared equals {n * n}
          </span>
          <span aria-hidden="true">
            {head}
            <span className="text-gold">25</span>
          </span>
        </p>
        <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
          The sutra <em className="font-display text-ink italic">Ekādhikena Pūrvena</em> — &ldquo;by one more than the one
          before&rdquo;. One of many techniques taught in class.
        </p>
      </div>
    </div>
  )
}
