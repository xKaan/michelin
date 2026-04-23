import type { EstablishmentView } from '@/types/database'
import { MichelinBadge } from '@/components/shared/MichelinBadge'

interface Props {
  establishments: EstablishmentView[]
  onSelect: (e: EstablishmentView) => void
}

export function MapSidebar({ establishments, onSelect }: Props) {
  return (
    <aside className="hidden md:flex flex-col w-72 flex-shrink-0 border-r border-border bg-background overflow-y-auto">
      <div className="px-4 py-3 border-b border-border/60 flex-shrink-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {establishments.length} établissement{establishments.length !== 1 ? 's' : ''} visible{establishments.length !== 1 ? 's' : ''}
        </span>
      </div>
      <ul>
        {establishments.length === 0 && (
          <li className="px-4 py-6 text-xs text-muted-foreground text-center">
            Aucun établissement dans cette zone
          </li>
        )}
        {establishments.map(est => (
          <li key={est.id}>
            <button
              onClick={() => onSelect(est)}
              className="w-full flex flex-col items-start gap-0.5 px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border/40 last:border-0"
            >
              <div className="flex items-center gap-2 w-full min-w-0">
                <MichelinBadge status={est.michelin_status} size={11} />
                <span className="text-sm font-medium text-foreground truncate">{est.name}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                <span>{est.establishment_type === 'hotel' ? 'Hôtel' : 'Restaurant'}</span>
                {(est.city || est.address) && (
                  <>
                    <span>·</span>
                    <span className="truncate">{est.city ?? est.address}</span>
                  </>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
