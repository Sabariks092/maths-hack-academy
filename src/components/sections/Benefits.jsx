import { benefits } from '../../data/content'
import Icon from '../ui/Icon'
import { Reveal, SectionLabel } from '../ui/primitives'

export default function Benefits() {
  return (
    <section id="why" className="bg-paper-deep py-24 md:py-32">
      <div className="container-page grid gap-16 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-5">
          <figure className="relative mx-auto max-w-md lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-t-full border border-ink/10 bg-[#f6e3b4]">
              <img
                src="/assets/learner-illustration.png"
                alt="A smiling student in a yellow hoodie works out 36 × 25 = 900 in a notebook, beside books labelled Faster, Easier, Smarter"
                width="485"
                height="440"
                loading="lazy"
                className="aspect-[485/440] w-full object-cover mix-blend-multiply"
              />
            </div>
            <figcaption className="mt-5 flex items-baseline justify-between gap-4 border-t border-ink/15 pt-4">
              <span className="font-hand text-2xl text-teal">36 × 25 = 900</span>
              <span className="text-right text-xs uppercase tracking-[0.18em] text-muted">Done in a single line</span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="lg:col-span-7 lg:pt-6">
          <Reveal>
            <SectionLabel index="02" label="Why Vedic Maths" />
            <h2 className="mt-8 font-display text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1.04] font-light tracking-[-0.02em] text-balance">
              Why learn <em className="italic">Vedic Maths?</em>
            </h2>
            <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft">
              What changes for a child when calculation stops being the hard part.
            </p>
          </Reveal>

          <ol className="mt-14">
            {benefits.map((b, i) => (
              <Reveal
                as="li"
                key={b.title}
                delay={i * 90}
                className="group grid grid-cols-[2.5rem_1fr_auto] items-start gap-x-4 border-t border-ink/15 py-8 last:border-b sm:grid-cols-[4rem_1fr_auto] sm:gap-x-6"
              >
                <span className="font-display text-3xl font-light italic text-gold sm:text-4xl">{i + 1}</span>
                <div>
                  <h3 className="font-display text-xl sm:text-[1.6rem] sm:leading-tight">{b.title}</h3>
                  <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-muted">{b.text}</p>
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-full border border-ink/20 text-ink transition-all duration-500 group-hover:rotate-[20deg] group-hover:border-gold-bright group-hover:bg-gold-bright">
                  <Icon name={b.icon} />
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
