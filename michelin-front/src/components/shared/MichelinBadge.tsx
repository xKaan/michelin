// src/components/shared/MichelinBadge.tsx
import type { MichelinStatus } from '@/types/database'

export function Rosettes({ count, size = 13 }: { count: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <img key={i} src="/etoile_michelin.png" alt="" width={size} height={size} className="object-contain" />
      ))}
    </span>
  )
}

const STAR_COUNTS: Record<MichelinStatus, number> = { three: 3, two: 2, one: 1, bib: 0, none: 0 }

export function MichelinBadge({ status, size }: { status: MichelinStatus; size?: number }) {
  if (status === 'none') return null
  if (status === 'bib') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
        Bib
      </span>
    )
  }
  return <Rosettes count={STAR_COUNTS[status]} size={size ?? 12} />
}
