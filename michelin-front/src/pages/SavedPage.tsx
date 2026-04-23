import { Bookmark } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useWishlist } from '@/hooks/useWishlist'
import { EstablishmentRow } from '@/components/explore/EstablishmentRow'
import type { Establishment, EstablishmentView } from '@/types/database'

function toView(e: Establishment): EstablishmentView {
  const m = typeof e.coordinates === 'string'
    ? e.coordinates.match(/POINT\(([^ ]+) ([^)]+)\)/)
    : null
  const { coordinates: _c, ...rest } = e as Establishment & { coordinates: unknown }
  return { ...rest, lat: m ? parseFloat(m[2]) : 0, lng: m ? parseFloat(m[1]) : 0 }
}

interface SavedPageProps {
  onEstablishmentClick: (e: EstablishmentView) => void
}

export function SavedPage({ onEstablishmentClick }: SavedPageProps) {
  const { user } = useAuth()
  const { data: lists = [], isLoading } = useWishlist(user?.id ?? null)

  const totalItems = lists.reduce((n, l) => n + l.list_items.length, 0)
  const hasMultipleLists = lists.filter(l => l.list_items.length > 0).length > 1

  return (
    <div className="max-w-lg md:max-w-3xl mx-auto px-4 pt-4 pb-32 md:pb-8">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Mes favoris</h1>
      <p className="text-sm text-muted-foreground mb-5">
        {totalItems === 0
          ? 'Aucun établissement sauvegardé'
          : `${totalItems} établissement${totalItems > 1 ? 's' : ''}`}
      </p>

      {isLoading && (
        <div className="py-16 text-center text-sm text-muted-foreground">Chargement...</div>
      )}

      {!isLoading && totalItems === 0 && (
        <div className="py-16 text-center rounded-3xl border border-dashed border-border flex flex-col items-center gap-3">
          <Bookmark className="size-10 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="text-sm font-semibold">Aucun favori pour l'instant</p>
          <p className="text-xs text-muted-foreground max-w-[220px]">
            Appuie sur le signet dans une fiche établissement pour le sauvegarder ici
          </p>
        </div>
      )}

      {lists.map(list => {
        if (list.list_items.length === 0) return null
        return (
          <div key={list.id} className="mb-6">
            {hasMultipleLists && (
              <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 pl-1">
                {list.name}
              </h2>
            )}
            <div className="flex flex-col gap-2.5">
              {list.list_items.map(item => (
                <EstablishmentRow
                  key={item.id}
                  item={toView(item.establishment)}
                  onClick={() => onEstablishmentClick(toView(item.establishment))}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
