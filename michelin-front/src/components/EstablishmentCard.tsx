import { X, MapPin, UtensilsCrossed, BedDouble } from 'lucide-react'
import type { EstablishmentView, MichelinStatus } from '@/types/database'

const STATUS_META: Record<MichelinStatus, { label: string; stars: string; color: string }> = {
  three: { label: '3 étoiles Michelin', stars: '★★★', color: 'text-amber-500' },
  two:   { label: '2 étoiles Michelin', stars: '★★',  color: 'text-primary' },
  one:   { label: '1 étoile Michelin',  stars: '★',   color: 'text-primary' },
  bib:   { label: 'Bib Gourmand',       stars: 'Bib', color: 'text-orange-500' },
  none:  { label: '',                   stars: '',     color: 'text-muted-foreground' },
}

interface Props {
  establishment: EstablishmentView | null
  onClose: () => void
}

export function EstablishmentCard({ establishment: e, onClose }: Props) {
  const meta = e ? STATUS_META[e.michelin_status] : null
  const Icon = e?.establishment_type === 'hotel' ? BedDouble : UtensilsCrossed

  return (
    <div
      className={[
        'fixed bottom-0 left-0 right-0 z-60 transition-transform duration-300 ease-out',
        e ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
    >
      <div className="mx-4 mb-28 bg-background rounded-3xl shadow-2xl border border-border/60 overflow-hidden">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-foreground/15" />
        </div>

        <div className="px-5 pb-6 pt-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="size-5 text-primary" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                {meta && meta.stars && (
                  <p className={`text-sm font-semibold tracking-wide ${meta.color} mb-0.5`}>
                    {meta.stars}
                    <span className="font-normal text-xs text-muted-foreground ml-1.5">
                      {meta.label}
                    </span>
                  </p>
                )}
                <p className="font-semibold text-base leading-tight truncate">
                  {e?.name ?? ''}
                </p>
                {e?.cuisines?.length ? (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {e.cuisines.slice(0, 3).join(' · ')}
                  </p>
                ) : null}
              </div>
            </div>

            <button
              onClick={onClose}
              className="size-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5"
              aria-label="Fermer"
            >
              <X className="size-4" />
            </button>
          </div>

          {(e?.address || e?.city) && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
              <MapPin className="size-3.5 flex-shrink-0" />
              <span className="truncate">
                {[e.address, e.city].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
