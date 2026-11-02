import { audienceFacts } from '../../data/content'
import { Reveal, SectionLabel } from '../ui/primitives'

export default function Audience() {
  return (
    <section id="who" className="relative overflow-hidden bg-teal py-24 text-paper md:py-32">
      <div className="container-page grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <Reveal>
            <SectionLabel index="03" label="Who can learn" tone="light" />
            <h2 className="mt-8 font-display text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.04] font-light tracking-[-0.02em] text-balance">
              For young minds, from <em className="italic text-gold-soft">Grade 4 &amp; above.</em>
            </h2>
          </Reveal>

          <ul className="mt-14 grid gap-px bg-paper/20 sm:grid-cols-3">
            {audienceFacts.map((fact, i) => (
              <Reveal as="li" key={fact.title} delay={i * 110} className="bg-teal py-6 sm:px-6 sm:first:pl-0">
                <p className="font-display text-5xl font-light tracking-[-0.03em]">{fact.value}</p>
                <p className="mt-4 text-sm font-semibold">{fact.title}</p>
                <p className="mt-1 text-sm text-paper/70">{fact.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={150} className="lg:col-span-5">
          <figure className="relative bg-paper px-6 pt-8 pb-6 text-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)] sm:px-10 lg:rotate-[1.5deg]">
            <img
              src="/assets/abacus.svg"
              alt="An abacus with gold, teal and black counting beads"
              width="430"
              height="304"
              loading="lazy"
              className="w-full"
            />
            <figcaption className="mt-4 flex items-baseline justify-between border-t border-ink/15 pt-4">
              <span className="font-hand text-2xl text-teal">count · group · calculate</span>
              <span className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">Online classes</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
