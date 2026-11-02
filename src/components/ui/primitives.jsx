import { useEffect, useRef, useState } from 'react'

/** Fades/slides children in the first time they scroll into view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => !('IntersectionObserver' in window))

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible])

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

const buttonStyles = {
  ink: 'bg-ink text-paper hover:bg-ink-soft',
  gold: 'bg-gold-bright text-ink hover:bg-gold-soft',
  outline: 'border border-ink/40 text-ink hover:bg-ink hover:text-paper hover:border-ink',
  'outline-light': 'border border-paper/40 text-paper hover:bg-paper hover:text-ink hover:border-paper',
}

export function Button({ href, variant = 'ink', className = '', children }) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center justify-center gap-3 px-6 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${buttonStyles[variant]} ${className}`}
    >
      {children}
      <Arrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  )
}

export function Arrow({ className = '' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M1 8h13M9 3l5 5-5 5" />
    </svg>
  )
}

/** "01 — The method" style label with a hairline rule. */
export function SectionLabel({ index, label, tone = 'dark', className = '' }) {
  const light = tone === 'light'
  return (
    <div className={`flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] ${light ? 'text-paper/75' : 'text-muted'} ${className}`}>
      <span className={`font-display text-sm normal-case italic tracking-normal ${light ? 'text-gold-soft' : 'text-gold'}`}>{index}</span>
      <span className={`h-px w-10 ${light ? 'bg-paper/40' : 'bg-ink/25'}`} />
      <span>{label}</span>
    </div>
  )
}

/** Hand-painted gold brush stroke, echoing the poster headlines. */
export function Brush({ className = '', color = 'var(--color-gold-bright)' }) {
  return (
    <svg viewBox="0 0 400 64" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        fill={color}
        d="M8 20c38-9 92-11 148-12 66-2 132-2 196 2 18 1 32 3 42 6l-6 7 4 8c-2 6-8 10-6 15 2 4-10 7-30 8-70 3-140 4-210 5-48 1-96 2-136-1-8-1-10-6-6-11-5-4-6-9 0-13-6-6-4-11 4-14z"
      />
      <path fill={color} opacity=".55" d="M30 52c80 4 190 3 300-1 20-1 34 0 40 3-90 6-230 8-340 3z" />
    </svg>
  )
}

/** Small diamond, the inner motif of the logo, used as a separator. */
export function Diamond({ className = '' }) {
  return <span aria-hidden="true" className={`inline-block h-2 w-2 rotate-45 bg-gold ${className}`} />
}
