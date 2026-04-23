import { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useAllEstablishments } from "@/hooks/useRestaurants";
import type { EstablishmentView } from "@/types/database";
import { EstablishmentRow } from '@/components/explore/EstablishmentRow'
import { FilterChip } from '@/components/shared/FilterChip'
import { SearchInput } from '@/components/shared/SearchInput'

interface ExplorePageProps {
  onEstablishmentClick: (e: EstablishmentView) => void;
}

// --- Filter types ---

type TypeFilter = "all" | "restaurant" | "hotel";
type StarFilter = "all" | "starred" | "bib";

const TYPE_LABELS: Record<TypeFilter, string> = {
  all:        "Tout",
  restaurant: "Restaurants",
  hotel:      "Hôtels",
};

const STAR_LABELS: Record<StarFilter, string> = {
  all:     "Tous niveaux",
  starred: "Étoilés",
  bib:     "Bib Gourmand",
};

// --- Page ---

export function ExplorePage({ onEstablishmentClick }: ExplorePageProps) {
  const { data: all = [], isLoading } = useAllEstablishments();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [starFilter, setStarFilter] = useState<StarFilter>("all");
  const [showStarFilters, setShowStarFilters] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((e) => {
      if (typeFilter !== "all" && e.establishment_type !== typeFilter) return false;
      if (starFilter === "starred" && !["one", "two", "three"].includes(e.michelin_status)) return false;
      if (starFilter === "bib" && e.michelin_status !== "bib") return false;
      if (q) {
        const haystack = [e.name, e.city, ...(e.cuisines ?? [])].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [all, query, typeFilter, starFilter]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-4 pb-32">
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight mb-4">Explorer</h1>

      {/* Search bar */}
      <div className="mb-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Nom, ville, cuisine…"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
        {(Object.keys(TYPE_LABELS) as TypeFilter[]).map((t) => (
          <FilterChip
            key={t}
            label={TYPE_LABELS[t]}
            active={typeFilter === t}
            onClick={() => setTypeFilter(t)}
          />
        ))}
        <div className="w-px bg-border/60 flex-shrink-0" />
        <FilterChip
          label={
            starFilter === "all"
              ? "Distinction"
              : STAR_LABELS[starFilter]
          }
          active={starFilter !== "all"}
          onClick={() => setShowStarFilters((v) => !v)}
        />
      </div>

      {/* Star sub-filters */}
      {showStarFilters && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
          {(Object.keys(STAR_LABELS) as StarFilter[]).map((s) => (
            <FilterChip
              key={s}
              label={STAR_LABELS[s]}
              active={starFilter === s}
              onClick={() => {
                setStarFilter(s);
                setShowStarFilters(false);
              }}
            />
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
            <div key={i} className="h-[90px] rounded-2xl bg-muted animate-pulse" />
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
