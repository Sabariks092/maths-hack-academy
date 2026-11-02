import { heroFacts } from '../../data/content'
import { Arrow, Brush, Button } from '../ui/primitives'
import CrosswiseSlip from './CrosswiseSlip'

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* faint oversized cube outline in the background, from the logo */}
      <svg
        viewBox="0 0 100 112"
        className="pointer-events-none absolute -top-24 -right-40 hidden h-[44rem] text-ink/[0.045] lg:block"
        aria-hidden="true"
      >
        <path d="M50 4 95 30v52l-45 26L5 82V30zM5 30l45 26 45-26M50 56v52" fill="none" stroke="currentColor" strokeWidth=".6" />
      </svg>

      <div className="container-page relative grid gap-14 pt-10 pb-20 md:pt-16 lg:grid-cols-12 lg:gap-6 lg:pt-20 lg:pb-36">
        <div className="lg:col-span-7">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-muted">
            <span className="h-px w-10 bg-gold" />
            Vedic Maths
            <span className="text-gold">·</span>
            Online classes
            <span className="text-gold">·</span>
            Grade 4 &amp; above
          </p>

          <h1 className="mt-8 font-display text-[clamp(2.7rem,6.6vw,5.9rem)] leading-[0.98] font-light tracking-[-0.025em] text-balance">
            Faster calculations,{' '}
            <span className="relative inline-block whitespace-nowrap">
              <Brush className="animate-brush absolute -inset-x-3 top-[18%] -z-0 h-[78%] w-[calc(100%+1.5rem)] origin-left" />
              <em className="relative font-normal italic">bigger dreams.</em>
            </span>
          </h1>

          <p className="mt-9 max-w-[34rem] text-[1.075rem] leading-relaxed text-ink-soft">
            Learn special mathematical techniques to solve calculations{' '}
            <span className="font-semibold text-ink">faster, easier and smarter</span> — a smarter way to calculate, and
            the smart way to success.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <Button href="#enroll">Book a free demo class</Button>
            <a href="#method" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <span className="border-b border-ink/30 pb-0.5 transition-colors group-hover:border-gold">What is Vedic Maths?</span>
              <Arrow className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <dl className="mt-16 grid max-w-xl grid-cols-3 border-t border-ink/15">
            {heroFacts.map((fact, i) => (
              <div key={fact.label} className={`pt-5 ${i ? 'border-l border-ink/15 pl-4 sm:pl-6' : 'pr-4'}`}>
                <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted">{fact.label}</dt>
                <dd className="mt-1.5 font-display text-xl font-normal sm:text-2xl">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative mx-auto max-w-md lg:-mt-4 lg:ml-8 lg:max-w-none">
            <span className="absolute top-2 left-0 font-hand text-2xl text-teal -rotate-6 sm:text-[1.7rem]">
              72 ÷ 8 = 9
            </span>
            <img
              src="/assets/hero-number-blocks.svg"
              alt="Isometric number blocks stacked like steps, in the Math Hacks gold, ink and teal palette"
              width="560"
              height="500"
              className="relative w-full"
              fetchPriority="high"
            />
          </div>
          <div className="relative -mt-16 flex justify-center sm:-mt-24 lg:absolute lg:-bottom-24 lg:-left-28 lg:mt-0 lg:block">
            <CrosswiseSlip />
          </div>
          <p className="mt-6 text-center font-hand text-xl text-muted lg:absolute lg:-bottom-24 lg:left-52 lg:mt-0 lg:text-left">
            ← one line, no long multiplication
          </p>
        </div>
      </div>
    </section>
  )
}
