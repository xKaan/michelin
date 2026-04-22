import { useEffect, useState } from 'react'
import { X, MapPin, UtensilsCrossed, BedDouble, Phone, Clock, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'
import type { EstablishmentView, MichelinStatus } from '@/types/database'

const STATUS_META: Record<MichelinStatus, { label: string; count: number; isBib: boolean }> = {
  three: { label: '3 étoiles Michelin', count: 3, isBib: false },
  two:   { label: '2 étoiles Michelin', count: 2, isBib: false },
  one:   { label: '1 étoile Michelin',  count: 1, isBib: false },
  bib:   { label: 'Bib Gourmand',       count: 0, isBib: true },
  none:  { label: '',                   count: 0, isBib: false },
}

function MichelinRosettes({ count, size = 15 }: { count: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <img key={i} src="/etoile_michelin.png" alt="" width={size} height={size} className="object-contain" />
      ))}
    </span>
  )
}

const DAYS: Record<number, string> = {
  0: 'dimanche', 1: 'lundi', 2: 'mardi', 3: 'mercredi',
  4: 'jeudi', 5: 'vendredi', 6: 'samedi',
}

function parseMinutes(t: string): number {
  const m = t.match(/(\d+)h(\d+)?/)
  if (!m) return -1
  return parseInt(m[1]) * 60 + (m[2] ? parseInt(m[2]) : 0)
}

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

function getOpenStatus(opening_hours: Record<string, string> | null) {
  if (!opening_hours) return { isOpen: false, closingTime: null, todayHours: null }

  const dayName = DAYS[new Date().getDay()]
  const todayHours = opening_hours[dayName] ?? null

  if (!todayHours || todayHours.toLowerCase() === 'fermé') {
    return { isOpen: false, closingTime: null, todayHours }
  }

  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()

  for (const slot of todayHours.split('/')) {
    const parts = slot.trim().split('-')
    if (parts.length !== 2) continue
    const open = parseMinutes(parts[0].trim())
    const close = parseMinutes(parts[1].trim())
    if (open === -1 || close === -1) continue
    if (nowMin >= open && nowMin < close) {
      return { isOpen: true, closingTime: fmtTime(close), todayHours }
    }
  }

  return { isOpen: false, closingTime: null, todayHours }
}

interface Props {
  establishment: EstablishmentView | null
  onClose: () => void
}

export function EstablishmentCard({ establishment: e, onClose }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [hoursOpen, setHoursOpen] = useState(false)

  useEffect(() => { setExpanded(false); setHoursOpen(false) }, [e?.id])

  const meta = e ? STATUS_META[e.michelin_status] : null
  const Icon = e?.establishment_type === 'hotel' ? BedDouble : UtensilsCrossed
  const { isOpen, closingTime, todayHours } = getOpenStatus(e?.opening_hours ?? null)

  return (
    <div
      className={[
        'fixed bottom-0 left-0 right-0 z-60 transition-transform duration-300 ease-out',
        e ? 'translate-y-0' : 'translate-y-full',
      ].join(' ')}
    >
      <div className="mx-4 mb-28 bg-background rounded-3xl shadow-2xl border border-border/60 overflow-hidden">

        {/* Image — visible uniquement en mode étendu */}
        <div
          className={[
            'overflow-hidden transition-all duration-300',
            expanded ? 'h-44' : 'h-0',
          ].join(' ')}
        >
          {e?.image_url ? (
            <img
              src={e.image_url}
              alt={e.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/8 flex items-center justify-center">
              <Icon className="size-16 text-primary/25" strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Drag handle — cliquable pour expand/collapse */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex flex-col items-center w-full pt-3 pb-1 gap-1"
          aria-label={expanded ? 'Réduire' : 'Développer'}
        >
          <div className="w-10 h-1 rounded-full bg-foreground/15" />
          {expanded
            ? <ChevronDown className="size-3.5 text-muted-foreground/60" />
            : <ChevronUp className="size-3.5 text-muted-foreground/60" />
          }
        </button>

        <div className="px-5 pb-6 pt-1">
          {/* En-tête : icône + nom + fermer */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="size-5 text-primary" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                {meta && (meta.count > 0 || meta.isBib) && (
                  <p className="flex items-center gap-1.5 mb-0.5">
                    {meta.count > 0
                      ? <MichelinRosettes count={meta.count} size={15} />
                      : <span className="text-sm font-semibold text-orange-500">Bib</span>
                    }
                    <span className="text-xs text-muted-foreground">{meta.label}</span>
                  </p>
                )}
                <p className="font-semibold text-base leading-tight truncate">{e?.name ?? ''}</p>
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

          {/* Statut ouvert / fermé */}
          {e?.opening_hours && (
            <div className="flex items-center gap-2 mt-3">
              <span className={`size-2 rounded-full flex-shrink-0 ${isOpen ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className="text-xs text-muted-foreground">
                {isOpen
                  ? <>Ouvert · <span className="text-foreground">Ferme à {closingTime}</span></>
                  : todayHours && todayHours.toLowerCase() !== 'fermé'
                    ? <>Fermé · <span className="text-foreground">{todayHours}</span></>
                    : 'Fermé aujourd\'hui'
                }
              </span>
            </div>
          )}

          {/* Adresse */}
          {(e?.address || e?.city) && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <MapPin className="size-3.5 flex-shrink-0" />
              <span className="truncate">{[e.address, e.city].filter(Boolean).join(', ')}</span>
            </div>
          )}

          {/* Détails étendus */}
          <div
            className={[
              'overflow-hidden transition-all duration-300',
              expanded ? 'max-h-96 mt-3' : 'max-h-0',
            ].join(' ')}
          >
            {/* Téléphone */}
            {e?.phone && (
              <a
                href={`tel:${e.phone}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <Phone className="size-3.5 flex-shrink-0" />
                <span>{e.phone}</span>
              </a>
            )}

            {/* Horaires de la semaine */}
            {e?.opening_hours && (
              <div className="mt-1 border-t border-border/50 pt-3">
                <button
                  onClick={() => setHoursOpen(v => !v)}
                  className="flex items-center justify-between w-full text-xs font-medium text-foreground mb-2"
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    Horaires de la semaine
                  </span>
                  <ChevronRight
                    className={`size-3.5 text-muted-foreground transition-transform duration-200 ${hoursOpen ? 'rotate-90' : ''}`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${hoursOpen ? 'max-h-60' : 'max-h-0'}`}
                >
                  <div className="space-y-1 pb-1">
                    {Object.entries(e.opening_hours).map(([day, hours]) => {
                      const isToday = DAYS[new Date().getDay()] === day
                      return (
                        <div
                          key={day}
                          className={`flex justify-between gap-4 text-xs ${isToday ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                        >
                          <span className="capitalize">{day}</span>
                          <span>{hours}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
