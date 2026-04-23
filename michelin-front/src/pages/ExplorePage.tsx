import { useState, useMemo, useRef, useEffect } from "react";
import { ListFilter, SlidersHorizontal, Check, X } from "lucide-react";
import { useAllEstablishments } from "@/hooks/useRestaurants";
import type { EstablishmentView, MichelinStatus } from "@/types/database";
import { EstablishmentRow } from '@/components/explore/EstablishmentRow'
import { FilterChip } from '@/components/shared/FilterChip'
import { SearchInput } from '@/components/shared/SearchInput'
import { Rosettes } from '@/components/shared/MichelinBadge'
import { cn } from "@/lib/utils";

interface ExplorePageProps {
  onEstablishmentClick: (e: EstablishmentView) => void;
}

type TypeFilter = "all" | "restaurant" | "hotel";

const TYPE_LABELS: Record<TypeFilter, string> = {
  all:        "Tout",
  restaurant: "Restaurants",
  hotel:      "Hôtels",
};

const DISTINCTIONS: { value: MichelinStatus; label: string; stars: number | null; special?: string }[] = [
  { value: "three", label: "3 étoiles Michelin", stars: 3 },
  { value: "two",   label: "2 étoiles Michelin", stars: 2 },
  { value: "one",   label: "1 étoile Michelin",  stars: 1 },
  { value: "bib",   label: "Bib Gourmand",       stars: null, special: "Bib" },
  { value: "none",  label: "Sans distinction",    stars: null },
]


export function ExplorePage({ onEstablishmentClick }: ExplorePageProps) {
  const { data: all = [], isLoading } = useAllEstablishments();
  const [query, setQuery]           = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [distinctions, setDistinctions] = useState<Set<MichelinStatus>>(new Set());
  const [showDistPanel, setShowDistPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    if (!showDistPanel) return;
    function onDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowDistPanel(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showDistPanel]);

  function toggleDistinction(v: MichelinStatus) {
    setDistinctions(prev => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  }

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((e) => {
      if (typeFilter !== "all" && e.establishment_type !== typeFilter) return false;
      if (distinctions.size > 0 && !distinctions.has(e.michelin_status)) return false;
      if (q) {
        const haystack = [e.name, e.city, ...(e.cuisines ?? [])].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [all, query, typeFilter, distinctions]);

  return (
    <div className="max-w-lg md:max-w-3xl mx-auto px-4 pt-4 pb-32 md:pb-8">
      <h1 className="text-2xl font-bold tracking-tight mb-4">Explorer</h1>

      {/* Search + funnel button */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder="Nom, ville, cuisine…" />
        </div>

        {/* Funnel button */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setShowDistPanel(v => !v)}
            className={cn(
              "relative size-10 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
              distinctions.size > 0 || showDistPanel
                ? "bg-primary border-primary text-white"
                : "bg-card border-border/60 text-foreground/60 hover:border-primary/40",
            )}
            aria-label="Filtrer par distinction"
          >
            <ListFilter className="size-4" />
            {distinctions.size > 0 && (
              <span className="absolute -top-1 -right-1 size-4 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                {distinctions.size}
              </span>
            )}
          </button>

          {/* Multi-select dropdown */}
          {showDistPanel && (
            <div className="absolute right-0 top-12 z-50 w-60 bg-background border border-border/60 rounded-2xl shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                <span className="text-[13px] font-bold">Distinction</span>
                <div className="flex items-center gap-2">
                  {distinctions.size > 0 && (
                    <button
                      onClick={() => setDistinctions(new Set())}
                      className="text-[11px] text-primary font-semibold"
                    >
                      Tout effacer
                    </button>
                  )}
                  <button onClick={() => setShowDistPanel(false)} className="text-muted-foreground">
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="py-1">
                {DISTINCTIONS.map(d => {
                  const selected = distinctions.has(d.value);
                  return (
                    <button
                      key={d.value}
                      onClick={() => toggleDistinction(d.value)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                        selected ? "bg-primary/8" : "hover:bg-muted/60",
                      )}
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        "size-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors",
                        selected ? "bg-primary border-primary" : "border-border",
                      )}>
                        {selected && <Check className="size-2.5 text-white" strokeWidth={3} />}
                      </div>

                      {/* Stars or label */}
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        {d.stars !== null
                          ? <Rosettes count={d.stars} size={13} />
                          : d.special
                            ? <span className="text-[12px] font-bold text-amber-500">{d.special}</span>
                            : <span className="size-1.5 rounded-full bg-foreground/30" />
                        }
                        <span className={cn(
                          "text-[13px] truncate",
                          selected ? "font-semibold text-foreground" : "text-foreground/70",
                        )}>
                          {d.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 mb-4">
        {(Object.keys(TYPE_LABELS) as TypeFilter[]).map((t) => (
          <FilterChip
            key={t}
            label={TYPE_LABELS[t]}
            active={typeFilter === t}
            onClick={() => setTypeFilter(t)}
          />
        ))}
      </div>

      {/* Active distinction badges */}
      {distinctions.size > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {DISTINCTIONS.filter(d => distinctions.has(d.value)).map(d => (
            <button
              key={d.value}
              onClick={() => toggleDistinction(d.value)}
              className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-[12px] font-semibold"
            >
              {d.stars !== null
                ? <Rosettes count={d.stars} size={13} />
                : d.special
                  ? <span className="text-amber-500 font-bold text-[11px]">{d.special}</span>
                  : null
              }
              {d.label}
              <X className="size-3" />
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-3">
        {isLoading ? "Chargement…" : `${results.length} établissement${results.length !== 1 ? "s" : ""}`}
      </p>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[90px] md:h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <SlidersHorizontal className="size-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucun résultat pour ces filtres.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((e) => (
            <EstablishmentRow
              key={e.id}
              item={e}
              onClick={() => onEstablishmentClick(e)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
