// src/components/explore/EstablishmentRow.tsx
import { MapPin, BedDouble, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EstablishmentView } from '@/types/database'
import { MichelinBadge } from '@/components/shared/MichelinBadge'

interface EstablishmentRowProps {
  item: EstablishmentView
  onClick: () => void
}

export function EstablishmentRow({ item, onClick }: EstablishmentRowProps) {
  const Icon = item.establishment_type === 'hotel' ? BedDouble : UtensilsCrossed

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-card rounded-2xl p-3 border border-border/60 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors active:scale-[0.99]"
    >
      <div className="size-[72px] shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="size-full object-cover" />
        ) : (
          <Icon className="size-7 text-muted-foreground/50" strokeWidth={1.5} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm leading-tight truncate">{item.name}</span>
          {item.michelin_status !== 'none' && <MichelinBadge status={item.michelin_status} />}
        </div>

        {item.cuisines && item.cuisines.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-1">
            {item.cuisines.slice(0, 2).map(c => (
              <span key={c} className="text-[10px] font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                {c}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{item.city ?? item.address ?? '—'}</span>
        </div>
      </div>

      <span className={cn(
        'shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full',
        item.establishment_type === 'hotel'
          ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300'
          : 'bg-muted text-muted-foreground',
      )}>
        {item.establishment_type === 'hotel' ? 'Hôtel' : 'Restaurant'}
      </span>
    </button>
  )
}
