import { demoReasons } from '../../data/content'
import Icon from '../ui/Icon'
import { Button, Reveal, SectionLabel } from '../ui/primitives'

export default function DemoReasons() {
  return (
    <section id="demo" className="py-24 md:py-32">
      <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Reveal className="lg:sticky lg:top-28">
            <SectionLabel index="04" label="The free demo" />
            <h2 className="mt-8 font-display text-[clamp(2.25rem,4.6vw,3.6rem)] leading-[1.05] font-light tracking-[-0.02em] text-balance">
              Why should you attend the <em className="italic text-gold">Vedic Maths</em> demo session?
            </h2>
            <p className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink-soft">
              One session to see the method at work — before you decide on anything.
            </p>
            <p className="mt-10 max-w-xs -rotate-3 font-hand text-[1.8rem] leading-tight text-teal">
              Faster calculations, <br />
              bigger dreams!
            </p>
            <Button href="#enroll" className="mt-10">
              Book the free demo
            </Button>
          </Reveal>
        </div>

        <ol className="lg:col-span-7">
          {demoReasons.map((reason, i) => (
            <Reveal
              as="li"
              key={reason.text}
              delay={i * 70}
              className="group relative grid grid-cols-[3rem_1fr] items-center gap-x-5 border-t border-ink/15 py-7 last:border-b sm:grid-cols-[3.5rem_3rem_1fr] sm:gap-x-6 sm:py-8"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full border-[1.5px] border-gold font-display text-xl text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-paper sm:h-14 sm:w-14 sm:text-2xl">
                {i + 1}
              </span>
              <span className="hidden text-ink-soft sm:block">
                <Icon name={reason.icon} className="h-7 w-7" />
              </span>
              <p className="font-display text-lg leading-snug transition-transform duration-300 group-hover:translate-x-1 sm:text-[1.45rem]">
                {reason.text}
                {reason.tag && (
                  <span className="ml-3 inline-block translate-y-[-0.2em] bg-gold-soft px-2 py-1 align-middle font-sans text-[0.6rem] font-bold uppercase tracking-[0.16em] text-ink">
                    {reason.tag}
                  </span>
                )}
              </p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
