import { Brand } from '../ui/Brand'
import { Arrow, Diamond } from '../ui/primitives'
import MathBackdrop from './MathBackdrop'

/** Full-page shell: maths backdrop, brand, and a paper card holding the form. */
export function FormPage({ eyebrow, title, intro, children }) {
  return (
    <div className="paper-grain relative isolate flex min-h-svh flex-col">
      <MathBackdrop />
      <div className="container-page flex flex-1 flex-col items-center py-8 sm:py-12">
        <a href="/" aria-label="Math Hacks — home" className="mb-8 sm:mb-10">
          <Brand />
        </a>
        <main className="animate-fade-up w-full max-w-xl border border-ink/10 bg-[#fffcf3] shadow-[0_24px_60px_-28px_rgb(22_21_15/0.35)]">
          <div className="h-1.5 bg-gradient-to-r from-gold via-gold-bright to-teal" />
          <div className="px-5 py-8 sm:px-10 sm:py-10">
            <p className="flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-muted">
              <Diamond /> {eyebrow}
            </p>
            <h1 className="mt-4 font-display text-[clamp(2rem,6vw,2.75rem)] leading-[1.05] font-light tracking-[-0.02em] text-balance">
              {title}
            </h1>
            {intro && <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{intro}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

const inputBase =
  'block w-full border border-ink/20 bg-paper/60 px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted/60 transition-colors outline-none focus:border-teal focus:bg-white focus:ring-2 focus:ring-teal/20 aria-[invalid=true]:border-red-700'

export function Field({ label, name, hint, as = 'input', className = '', ...props }) {
  const id = `f-${name}`
  const Tag = as
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[0.78rem] font-semibold tracking-wide text-ink-soft">
        {label}
        {props.required && <span className="ml-0.5 text-gold">*</span>}
      </label>
      <Tag id={id} name={name} className={`${inputBase} ${as === 'textarea' ? 'min-h-28 resize-y' : ''}`} {...props} />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

/** Hidden honeypot field — bots fill it, people never see it. */
export function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
      </label>
    </div>
  )
}

export function SubmitButton({ sending, children }) {
  return (
    <button
      type="submit"
      disabled={sending}
      className="group inline-flex w-full items-center justify-center gap-3 bg-ink px-6 py-4 text-sm font-semibold tracking-wide text-paper transition-colors duration-300 hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-70"
    >
      {sending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper" />
          Please wait…
        </>
      ) : (
        <>
          {children}
          <Arrow className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </>
      )}
    </button>
  )
}

export function ErrorNote({ message }) {
  if (!message) return null
  return (
    <p role="alert" className="border-l-2 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-800">
      {message}
    </p>
  )
}

export function SuccessPanel({ title, message, actionLabel, onAction }) {
  return (
    <div role="status" className="animate-fade-up text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-teal-soft text-teal-deep">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h2 className="mt-6 font-display text-2xl font-light">{title}</h2>
      <p className="mx-auto mt-3 max-w-sm text-[0.95rem] leading-relaxed text-muted">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-8 border border-ink/40 px-6 py-3 text-sm font-semibold tracking-wide transition-colors hover:bg-ink hover:text-paper"
      >
        {actionLabel}
      </button>
    </div>
  )
}
