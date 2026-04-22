import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useProfile";
import { ChevronLeft, MoreHorizontal, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

// --- Types ---
interface Badge {
  id: string;
  label: string;
  date: string;
  image?: string; // optional real image, falls back to placeholder
}

interface NotebookEntry {
  id: string;
  image?: string; // optional real image, falls back to placeholder
}

// --- Tier helpers ---
const TIER_LABELS: Record<string, string> = {
  explorer: "Explorateur",
  novice: "Novice culinaire",
  gourmet: "Gourmet",
  expert: "Expert",
  master: "Maître",
};

function getTierLabel(tier: string): string {
  return TIER_LABELS[tier] ?? tier;
}

/** Compute level from total XP (100 XP per level, simple formula). */
function xpToLevel(xp: number): number {
  return Math.floor(xp / 400) + 1;
}

// --- Mock data (replace with real API data as needed) ---
const MOCK_BADGES: Badge[] = [
  { id: "1", label: "Première visite", date: "01/09/2025" },
  { id: "2", label: "3 étoiles !", date: "10/02/2026" },
  { id: "3", label: "Truffé", date: "21/03/2026" },
  { id: "4", label: "Str…", date: "30/0…" },
];

const MOCK_NOTEBOOK: NotebookEntry[] = [{ id: "1" }, { id: "2" }, { id: "3" }];

// --- Sub-components ---

function BackButton(
  { onClick }: { onClick?: () => void }
) {
  return (
    <button
      aria-label="Retour"
      className="size-9 flex cursor-pointer items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-foreground"
      onClick={onClick}
    >
      <ChevronLeft className="size-5" />
    </button>
  );
}

function MoreButton() {
  return (
    <button
      aria-label="Plus d'options"
      className="size-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-foreground"
    >
      <MoreHorizontal className="size-5" />
    </button>
  );
}

function HeroBanner({ buddyImg }: { buddyImg?: string }) {
  const navigate = useNavigate()
  return (
    <div className="relative w-full h-[320px] bg-[#dde0ef] overflow-hidden flex items-end justify-center">
      {/* Navigation overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <BackButton onClick={() => navigate(-1)} />
        <MoreButton />
      </div>

      {/* Buddy character — swap buddyImg for real PNG */}
      {buddyImg ? (
        <img
          src={buddyImg}
          alt="Buddy"
          className="h-[280px] w-auto object-contain select-none"
          draggable={false}
        />
      ) : (
        /* Placeholder silhouette */
        <div className="h-[240px] w-[180px] mb-2 rounded-3xl bg-white/30 flex items-center justify-center text-white/50 text-xs select-none">
          buddy.png
        </div>
      )}
    </div>
  );
}

function XPLevelPill({ xp, level }: { xp: number; level: number }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full bg-foreground text-background px-3 py-2 text-sm font-semibold shadow-md">
      <span className="px-4 flex flex-col gap-1 items-center">
        <span className="text-xs font-normal mr-1">
          Points d'xp
        </span>
        <span className="text-xl">
          {xp.toLocaleString("fr-FR")}
        </span>
      </span>
      <div className="w-px h-6 bg-background/20" />
      <span className="px-4 flex flex-col gap-1 items-center">
        <span className="text-xs font-normal mr-1">
          Niveau
        </span>
        <span className="text-xl">
          {level}
        </span>
      </span>
    </div>
  );
}

function VerifiedBadge() {
  return (
    <svg
      className="inline-block size-5 ml-1.5 text-primary align-middle"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-label="Vérifié"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SectionHeader({ label, href }: { label: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold tracking-tight">{label}</h2>
      {href && (
        <a href={href} className="text-muted-foreground">
          <ChevronRight className="size-5" />
        </a>
      )}
    </div>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
      <div className="size-[72px] rounded-full overflow-hidden bg-amber-900/20 flex items-center justify-center shadow-inner">
        {badge.image ? (
          <img
            src={badge.image}
            alt={badge.label}
            className="size-full object-cover"
          />
        ) : (
          /* Placeholder gradient circle */
          <div className="size-full bg-gradient-to-br from-amber-700 to-amber-900 rounded-full flex items-center justify-center text-white/30 text-[10px]">
            🏅
          </div>
        )}
      </div>
      <span className="text-[11px] font-medium text-center leading-tight line-clamp-2 max-w-[72px]">
        {badge.label}
      </span>
      <span className="text-[10px] text-muted-foreground">{badge.date}</span>
    </div>
  );
}

function NotebookCard({ entry }: { entry: NotebookEntry }) {
  return (
    <div className="w-[100px] aspect-[3/2] rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-sm">
      {entry.image ? (
        <img
          src={entry.image}
          alt="Carnet"
          className="size-full object-cover"
        />
      ) : (
        <div className="size-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center text-muted-foreground/40 text-xs">
          photo
        </div>
      )}
    </div>
  );
}

// --- Loading & Error states ---

function LoadingState() {
  return (
    <div className="max-w-lg mx-auto pt-28 px-4 pb-12">
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-sm text-muted-foreground text-center animate-pulse">
        Chargement du profil…
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="max-w-lg mx-auto pt-28 px-4 pb-12">
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
        Impossible de charger le profil : {message}
      </div>
    </div>
  );
}

// --- Main Page ---

export function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading, error } = useUserProfile(user?.id ?? null);

  const displayName =
    profile?.display_name ?? user?.user_metadata?.display_name ?? "Sans nom";
  const email = profile?.email ?? user?.email ?? "email@exemple.com";
  const tier = profile?.tier ?? "novice";
  const xpTotal = profile?.xp_total ?? 0;
  const level = useMemo(() => xpToLevel(xpTotal), [xpTotal]);

  // Buddy image: replace with real path/URL when available
  const buddyImg: string | undefined = undefined; // e.g. '/assets/buddy.png'

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="max-w-lg mx-auto bg-background min-h-screen overflow-x-hidden">
      {/* Hero with buddy character */}
      <HeroBanner buddyImg={buddyImg} />

      {/* White card sheet — overlaps the hero slightly */}
      <div className="relative -mt-6 rounded-t-[40px] bg-background px-5 pt-6 pb-12 z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        {/* Identity */}
        <div className="flex flex-col items-center text-center gap-1 mb-5">
          <h1 className="text-2xl font-bold tracking-tight">
            {displayName}
            <VerifiedBadge />
          </h1>
          <p className="text-sm text-muted-foreground">{getTierLabel(tier)}</p>
        </div>

        {/* XP / Level pill */}
        <div className="flex justify-center mb-8">
          <XPLevelPill xp={xpTotal} level={level} />
        </div>

        {/* Badges section */}
        <section className="mb-8">
          <SectionHeader label={t("profile.badges", "Badges")} href="#" />
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {MOCK_BADGES.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </section>

        {/* Notebook section */}
        <section>
          <SectionHeader label={t("profile.notebook", "Mon carnet")} href="#" />
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {MOCK_NOTEBOOK.map((entry) => (
              <NotebookCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
