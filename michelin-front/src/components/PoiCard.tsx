import { X, UtensilsCrossed, Coffee, Wine, BedDouble, Building2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface SelectedPoi {
  name?: string
  class: string
  subclass?: string
}

const CLASSES: Record<string, { label: string; icon: LucideIcon }> = {
  restaurant: { label: 'Restaurant',  icon: UtensilsCrossed },
  fast_food:  { label: 'Fast food',   icon: UtensilsCrossed },
  cafe:       { label: 'Café',        icon: Coffee },
  bar:        { label: 'Bar',         icon: Wine },
  hotel:      { label: 'Hôtel',       icon: BedDouble },
  hostel:     { label: 'Hostel',      icon: BedDouble },
  motel:      { label: 'Motel',       icon: Building2 },
}

interface Props {
  poi: SelectedPoi | null
  onClose: () => void
}

export function PoiCard({ poi, onClose }: Props) {
  const meta = poi ? (CLASSES[poi.class] ?? { label: poi.class, icon: UtensilsCrossed }) : null

  return (
    <div
      className={[
        'fixed bottom-0 left-0 right-0 z-60 transition-transform duration-300 ease-out',
        poi ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
    >
      <div className="mx-4 mb-28 bg-background rounded-3xl shadow-2xl border border-border/60 overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-foreground/15" />
        </div>

        <div className="px-5 pb-6 pt-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {meta && (
                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <meta.icon className="size-5 text-primary" strokeWidth={1.8} />
                </div>
              )}
              <div>
                <p className="font-semibold text-base leading-tight">
                  {poi?.name ?? 'Sans nom'}
                </p>
                {meta && (
                  <p className="text-xs text-foreground/50 mt-0.5">{meta.label}</p>
                )}
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
        </div>
      </div>
    </div>
  )
}
