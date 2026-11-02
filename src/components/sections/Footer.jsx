import { navLinks } from '../../data/content'
import { Brand } from '../ui/Brand'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="container-page flex flex-col gap-10 border-t border-paper/15 py-12 md:flex-row md:items-center md:justify-between">
        <a href="#top" aria-label="Math Hacks — back to top">
          <Brand tone="light" />
        </a>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-paper/70">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-gold-bright">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs text-paper/50">© {year} Math Hacks. Smart way to success.</p>
      </div>
    </footer>
  )
}
