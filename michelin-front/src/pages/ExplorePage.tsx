import { useState, useMemo } from "react";
import { Search, MapPin, UtensilsCrossed, BedDouble, SlidersHorizontal } from "lucide-react";
import { useAllEstablishments } from "@/hooks/useRestaurants";
import { cn } from "@/lib/utils";
import type { EstablishmentView, MichelinStatus } from "@/types/database";

interface ExplorePageProps {
  onEstablishmentClick: (e: EstablishmentView) => void;
}

// --- Michelin helpers ---

const MICHELIN_META: Record<MichelinStatus, { label: string; stars: number; isBib: boolean }> = {
  three: { label: "3 étoiles", stars: 3, isBib: false },
  two:   { label: "2 étoiles", stars: 2, isBib: false },
  one:   { label: "1 étoile",  stars: 1, isBib: false },
  bib:   { label: "Bib",       stars: 0, isBib: true },
  none:  { label: "",          stars: 0, isBib: false },
};

function MichelinBadge({ status }: { status: MichelinStatus }) {
  if (status === "none") return null;
  if (MICHELIN_META[status].isBib) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
        Bib
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: MICHELIN_META[status].stars }).map((_, i) => (
        <img key={i} src="/etoile_michelin.png" alt="★" className="size-3 object-contain" />
      ))}
    </span>
  );
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

// --- Row card ---

function EstablishmentRow({
  item,
  onClick,
}: {
  item: EstablishmentView;
  onClick: () => void;
}) {
  const hasDistinction = item.michelin_status !== "none";
  const Icon = item.establishment_type === "hotel" ? BedDouble : UtensilsCrossed;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-card rounded-2xl p-3 border border-border/60 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors active:scale-[0.99]"
    >
      {/* Image or icon placeholder */}
      <div className="size-[72px] flex-shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="size-full object-cover" />
        ) : (
          <Icon className="size-7 text-muted-foreground/50" strokeWidth={1.5} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm leading-tight truncate">{item.name}</span>
          {hasDistinction && <MichelinBadge status={item.michelin_status} />}
        </div>

        {item.cuisines && item.cuisines.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-1">
            {item.cuisines.slice(0, 2).map((c) => (
              <span
                key={c}
                className="text-[10px] font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3 flex-shrink-0" />
          <span className="truncate">{item.city ?? item.address ?? "—"}</span>
        </div>
      </div>

      {/* Type pill */}
      <span
        className={cn(
          "flex-shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full",
          item.establishment_type === "hotel"
            ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300"
            : "bg-muted text-muted-foreground",
        )}
      >
        {item.establishment_type === "hotel" ? "Hôtel" : "Restaurant"}
      </span>
    </button>
  );
}

// --- Filter chip ---

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-shrink-0 text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors",
        active
          ? "bg-primary text-white border-primary"
          : "bg-card text-foreground border-border/60 hover:border-primary/40",
      )}
    >
      {label}
    </button>
  );
}

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
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom, ville, cuisine…"
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-3 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none">
        {(Object.keys(TYPE_LABELS) as TypeFilter[]).map((t) => (
          <Chip
            key={t}
            label={TYPE_LABELS[t]}
            active={typeFilter === t}
            onClick={() => setTypeFilter(t)}
          />
        ))}
        <div className="w-px bg-border/60 flex-shrink-0" />
        <Chip
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
            <Chip
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
