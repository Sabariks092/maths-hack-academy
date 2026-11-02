import { sums } from '../../data/content'
import { Diamond } from '../ui/primitives'

const words = ['Faster', 'Easier', 'Smarter']

export default function Ticker() {
  // interleave the poster sums with the three promises
  const items = sums.flatMap((sum, i) => [
    { kind: 'sum', text: sum },
    { kind: 'word', text: words[i % words.length] },
  ])
  const loop = [...items, ...items]

  return (
    <div className="overflow-hidden border-y border-ink bg-ink py-5 text-paper" aria-label="Faster, easier, smarter">
      <ul className="animate-marquee flex w-max items-center gap-10 pr-10" aria-hidden="true">
        {loop.map((item, i) => (
          <li key={i} className="flex items-center gap-10 whitespace-nowrap">
            {item.kind === 'sum' ? (
              <span className="font-hand text-[1.9rem] leading-none text-gold-bright">{item.text}</span>
            ) : (
              <span className="font-display text-2xl font-light italic">{item.text}</span>
            )}
            <Diamond />
          </li>
        ))}
      </ul>
    </div>
  )
}
