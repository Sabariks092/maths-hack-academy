import { Reveal, SectionLabel } from '../ui/primitives'
import SquareTrick from './SquareTrick'

export default function Method() {
  return (
    <section id="method" className="py-24 md:py-32">
      <div className="container-page">
        <Reveal>
          <SectionLabel index="01" label="The method" />
        </Reveal>

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-7">
            <h2 className="font-display text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.04] font-light tracking-[-0.02em] text-balance">
              What is Vedic Maths? <em className="text-gold italic">A smarter way to calculate.</em>
            </h2>
            <div className="mt-9 grid gap-6 text-[1.05rem] leading-relaxed text-ink-soft sm:grid-cols-2 sm:gap-10">
              <p>
                Vedic Maths is a collection of special mathematical techniques that make calculations{' '}
                <span className="font-semibold text-ink">faster, easier and smarter</span>.
              </p>
              <p>
                Instead of long, step-by-step working, children learn patterns that reach the answer in a single line —
                and very often, in their head.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-5">
            <figure className="relative">
              <img
                src="/assets/geometry-set.svg"
                alt="A protractor, set square and pencil — the tools of a maths classroom"
                width="520"
                height="360"
                loading="lazy"
                className="w-full"
              />
              <figcaption className="absolute -bottom-2 right-2 font-hand text-xl text-muted rotate-[-3deg]">
                patterns, not long working
              </figcaption>
            </figure>
          </Reveal>
        </div>

        <Reveal className="mt-20 md:mt-24">
          <SquareTrick />
        </Reveal>
      </div>
    </section>
  )
}
