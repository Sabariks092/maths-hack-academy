import { enrollLink } from '../../data/content'
import { Button, Diamond, Reveal } from '../ui/primitives'

export default function ClosingCta() {
  return (
    <section id="enroll" className="relative overflow-hidden bg-ink text-paper">
      <div className="container-page grid items-center gap-16 py-24 md:py-32 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-7">
          <p className="flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-paper/70">
            <Diamond /> Free demo class available
          </p>
          <h2 className="mt-8 font-display text-[clamp(2.5rem,5.4vw,4.6rem)] leading-[1.02] font-light tracking-[-0.025em] text-balance">
            Witness the joy of learning maths <em className="italic text-gold-bright">the easy way.</em>
          </h2>
          <p className="mt-8 max-w-lg text-[1.05rem] leading-relaxed text-paper/75">
            Online Vedic Maths classes for students of Grade 4 and above. Start with a free demo — with a special
            discount for those who attend.
          </p>
          <div className="mt-11 flex flex-wrap items-center gap-4">
            <Button href={enrollLink.href} variant="gold">
              {enrollLink.label}
            </Button>
            <Button href="#demo" variant="outline-light">
              Six reasons to attend
            </Button>
          </div>
        </Reveal>

        <Reveal delay={150} className="lg:col-span-5">
          <figure className="relative mx-auto max-w-md">
            <div className="rounded-t-full bg-paper px-6 pt-16 pb-8 sm:px-10 sm:pt-20">
              <img
                src="/assets/book-stack.svg"
                alt="A stack of three books titled Vedic Maths, Sharpen Your Mind and Achieve More"
                width="460"
                height="320"
                loading="lazy"
                className="w-full"
              />
            </div>
            <figcaption className="mt-5 text-center font-hand text-2xl text-gold-soft">
              Sharpen your mind. Achieve more.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
