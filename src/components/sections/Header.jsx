import { useEffect, useState } from 'react'
import { navLinks } from '../../data/content'
import { Brand } from '../ui/Brand'
import { Button } from '../ui/primitives'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open ? 'border-b border-ink/10 bg-paper/90 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="container-page flex h-[4.5rem] items-center justify-between gap-6">
        <a href="#top" aria-label="Math Hacks — home" className="shrink-0">
          <Brand />
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-9 text-sm font-medium text-ink-soft">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative py-2 transition-colors hover:text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <Button href="#enroll" className="px-5 py-3">
              Book a free demo
            </Button>
          </div>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-6">
              <span className={`absolute left-0 h-px w-6 bg-ink transition-transform duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-px w-6 bg-ink transition-transform duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={`grid overflow-hidden transition-[grid-template-rows] duration-500 lg:hidden ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <ul className="container-page min-h-0">
          {navLinks.map((link, i) => (
            <li key={link.href} className="border-t border-ink/10">
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 py-4 font-display text-2xl font-light"
              >
                <span className="font-display text-sm italic text-gold">0{i + 1}</span>
                {link.label}
              </a>
            </li>
          ))}
          <li className="border-t border-ink/10 pt-5 pb-7 sm:hidden">
            <Button href="#enroll" className="w-full">
              Book a free demo
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
