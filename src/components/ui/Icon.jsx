// Thin line icons drawn for the landing page (24×24 grid).
const paths = {
  speed: (
    <>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="M12 17l4.5-5" />
      <circle cx="12" cy="17" r="1.2" fill="currentColor" />
      <path d="M6.5 11.5l1 .8M12 9v1.2M17.5 11.5l-1 .8" />
    </>
  ),
  confidence: (
    <>
      <circle cx="12" cy="8" r="2.6" />
      <path d="M5 6l3.5 6.5h7L19 6" />
      <path d="M9.5 12.5L9 20M14.5 12.5L15 20" />
      <path d="M12 2.2l.6 1.2 1.3.2-1 .9.3 1.3-1.2-.7-1.2.7.3-1.3-1-.9 1.3-.2z" fill="currentColor" stroke="none" />
    </>
  ),
  mind: (
    <>
      <path d="M12 5.5c-1-1.6-4-1.8-5 .3-2 .2-3 2.4-2 4-1.4 1.2-1 3.6.6 4.3-.2 2 1.8 3.4 3.6 2.6.7 1.4 2 1.8 2.8 1.3z" />
      <path d="M12 5.5c1-1.6 4-1.8 5 .3 2 .2 3 2.4 2 4 1.4 1.2 1 3.6-.6 4.3.2 2-1.8 3.4-3.6 2.6-.7 1.4-2 1.8-2.8 1.3z" />
      <path d="M12 5.5V18M9 9.5c1 0 1.6.6 1.6 1.6M15 9.5c-1 0-1.6.6-1.6 1.6M8.5 14h1.6M15.5 14h-1.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.2 2" />
    </>
  ),
  idea: (
    <>
      <path d="M9 17h6M10 20h4" />
      <path d="M8.5 14.2A5.5 5.5 0 1 1 15.5 14.2c-.7.6-1 1.4-1 2.3v.5h-5v-.5c0-.9-.3-1.7-1-2.3z" />
      <path d="M12 1.8v1.4M3.6 5.6l1 1M20.4 5.6l-1 1" />
    </>
  ),
  growth: (
    <>
      <path d="M4 20h16" />
      <path d="M6.5 20v-4M10.5 20v-7M14.5 20v-5M18.5 20v-9" />
      <path d="M5 11l4.5-4 3.5 3 6-6M15 4h4v4" />
    </>
  ),
  details: (
    <>
      <path d="M14 3H6v18h7" />
      <path d="M14 3l4 4v4M14 3v4h4" />
      <path d="M8.5 9h5M8.5 12h4M8.5 15h3" />
      <circle cx="16.5" cy="16.5" r="2.8" />
      <path d="M18.5 18.5l2.5 2.5" />
    </>
  ),
  discount: (
    <>
      <path d="M3.5 12.6V4.5a1 1 0 0 1 1-1h8.1l8 8a1 1 0 0 1 0 1.4l-7.1 7.1a1 1 0 0 1-1.4 0z" />
      <path d="M9 15l5-5" />
      <circle cx="9.6" cy="10.4" r=".9" fill="currentColor" />
      <circle cx="13.4" cy="14.6" r=".9" fill="currentColor" />
    </>
  ),
  gift: (
    <>
      <path d="M4 10h16v3H4zM5.5 13v7.5h13V13M12 10v10.5" />
      <path d="M12 10C10.5 6 6.5 6.5 7.5 8.5 8.2 10 12 10 12 10zM12 10c1.5-4 5.5-3.5 4.5-1.5C15.8 10 12 10 12 10z" />
    </>
  ),
  joy: (
    <>
      <circle cx="12" cy="12" r="5.5" />
      <path d="M9.6 13.2c1.3 1.6 3.5 1.6 4.8 0" />
      <path d="M10 10.5h.01M14 10.5h.01" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
}

export default function Icon({ name, className = 'h-6 w-6' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
