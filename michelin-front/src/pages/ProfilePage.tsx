import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useProfile";
import { useUserMascot, resolveBuddyImage } from "@/hooks/useMascot";
import { useFollowing, useFollow, useUnfollow } from "@/hooks/useSocial";
import { ChevronLeft, MoreHorizontal, ChevronRight, BadgeCheck, Palette, UserMinus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { QrCodeDisplay } from "@/components/QrCodeDisplay";
import { AppearanceSheet } from "@/components/AppearanceSheet";
import type { Badge as DBBadge } from "@/types/database";
import { storageUrl } from "@/lib/supabase";

const BADGE_IMAGES: Record<string, string> = {
  first_visit:  storageUrl('assets', 'badges/badge_1.png'),
  three_stars:  storageUrl('assets', 'badges/badge_2.png'),
  truffle:      storageUrl('assets', 'badges/badge_3.png'),
  streak_7:     storageUrl('assets', 'badges/badge_4.png'),
  gourmet_tier: storageUrl('assets', 'badges/badge_5.png'),
  expert_tier:  storageUrl('assets', 'badges/badge_6.png'),
};

const BADGE_LABELS: Record<string, string> = {
  first_visit:  "Première visite !",
  three_stars:  "3 étoiles !",
  truffle:      "Truffé",
  streak_7:     "Streak ×7",
  gourmet_tier: "Gourmet",
  expert_tier:  "Expert",
};

// --- Types ---
interface Badge {
  id: string;
  label: string;
  date: string;
  image?: string;
}

function dbBadgeToDisplay(b: DBBadge): Badge {
  return {
    id: b.id,
    label: BADGE_LABELS[b.badge_type] ?? b.badge_type,
    date: new Date(b.earned_at).toLocaleDateString("fr-FR"),
    image: BADGE_IMAGES[b.badge_type],
  };
}

interface NotebookEntry {
  id: string;
  image?: string;
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

function xpToLevel(xp: number): number {
  return Math.floor(xp / 400) + 1;
}

const MOCK_NOTEBOOK: NotebookEntry[] = [
  { id: "1", image: "/Restaurants/resto_1.webp" },
  { id: "2", image: "/Restaurants/resto_2.webp" },
  { id: "3", image: "/Restaurants/resto_3.webp" },
];

// --- Sub-components ---

function BackButton({ onClick }: { onClick?: () => void }) {
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

function MoreButton({ onAppearance }: { onAppearance: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        aria-label="Plus d'options"
        className="size-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-foreground"
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal className="size-5" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-20 min-w-[160px] rounded-xl bg-background shadow-lg border border-border overflow-hidden">
            <button
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium hover:bg-muted transition-colors"
              onClick={() => { setOpen(false); onAppearance(); }}
            >
              <Palette className="size-4 text-muted-foreground" />
              Apparence
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function lightenHex(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.round(r + (255 - r) * amount)},${Math.round(g + (255 - g) * amount)},${Math.round(b + (255 - b) * amount)})`
}

function FollowButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      aria-label="Suivre"
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#cb0028] shadow-sm text-white text-xs font-medium disabled:opacity-60"
      onClick={onClick}
    >
      <UserPlus className="size-4" />
      Suivre
    </button>
  );
}

function UnfollowButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <button
      aria-label="Ne plus suivre"
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm text-foreground text-xs font-medium disabled:opacity-60"
      onClick={onClick}
    >
      <UserMinus className="size-4" />
      Ne plus suivre
    </button>
  );
}

function HeroBanner({ buddyImg, onAppearance, isOwnProfile, avatarColor, isFollowing, onFollow, onUnfollow, followLoading, unfollowLoading }: { buddyImg?: string; onAppearance: () => void; isOwnProfile: boolean; avatarColor: string; isFollowing?: boolean; onFollow?: () => void; onUnfollow?: () => void; followLoading?: boolean; unfollowLoading?: boolean }) {
  const navigate = useNavigate();
  const haloColor = lightenHex(avatarColor, 0.55);
  return (
    <div className="relative w-full h-[320px] overflow-hidden flex items-end justify-center" style={{ backgroundColor: avatarColor }}>
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
        <BackButton onClick={() => navigate(-1)} />
        {isOwnProfile && <MoreButton onAppearance={onAppearance} />}
        {!isOwnProfile && isFollowing && onUnfollow && (
          <UnfollowButton onClick={onUnfollow} loading={unfollowLoading ?? false} />
        )}
        {!isOwnProfile && !isFollowing && onFollow && (
          <FollowButton onClick={onFollow} loading={followLoading ?? false} />
        )}
      </div>

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: haloColor, opacity: 0.6 }}
      />
      {buddyImg ? (
        <img
          src={buddyImg}
          alt="Buddy"
          className="h-[280px] w-auto object-contain select-none relative z-10"
          draggable={false}
        />
      ) : (
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
        <span className="text-xs font-normal mr-1">Points d'xp</span>
        <span className="text-xl">{xp.toLocaleString("fr-FR")}</span>
      </span>
      <div className="w-px h-6 bg-background/20" />
      <span className="px-4 flex flex-col gap-1 items-center">
        <span className="text-xs font-normal mr-1">Niveau</span>
        <span className="text-xl">{level}</span>
      </span>
    </div>
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
          <img src={badge.image} alt={badge.label} className="size-full object-cover" />
        ) : (
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
        <img src={entry.image} alt="Carnet" className="size-full object-cover" />
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
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const viewedUserId = paramUserId ?? user?.id ?? null;
  const isOwnProfile = !paramUserId || paramUserId === user?.id;

  const { data: profile, isLoading, error } = useUserProfile(viewedUserId);
  const { data: mascot } = useUserMascot(viewedUserId);

  const displayName =
    profile?.display_name ?? (isOwnProfile ? user?.user_metadata?.display_name : null) ?? "Sans nom";
  const tier = profile?.tier ?? "novice";
  const xpTotal = profile?.xp_total ?? 0;
  const level = useMemo(() => xpToLevel(xpTotal), [xpTotal]);

  const buddyImg = resolveBuddyImage(mascot);
  const badges = useMemo(
    () => (profile?.badges ?? []).map(dbBadgeToDisplay),
    [profile?.badges],
  );
  const [appearanceOpen, setAppearanceOpen] = useState(false);

  const { data: following } = useFollowing(!isOwnProfile ? user?.id ?? null : null);
  const isFollowing = useMemo(
    () => !isOwnProfile && (following ?? []).some((u) => u.id === viewedUserId),
    [isOwnProfile, following, viewedUserId],
  );
  const follow = useFollow();
  const unfollow = useUnfollow();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="max-w-lg mx-auto bg-background min-h-screen overflow-x-hidden">
      {/* Hero with buddy character */}
      <HeroBanner
        buddyImg={buddyImg}
        onAppearance={() => setAppearanceOpen(true)}
        isOwnProfile={isOwnProfile}
        avatarColor={profile?.avatar_color ?? '#dde0ef'}
        isFollowing={isFollowing}
        onFollow={() => viewedUserId && follow.mutate(viewedUserId)}
        onUnfollow={() => viewedUserId && unfollow.mutate(viewedUserId)}
        followLoading={follow.isPending}
        unfollowLoading={unfollow.isPending}
      />
      {isOwnProfile && <AppearanceSheet open={appearanceOpen} onClose={() => setAppearanceOpen(false)} />}

      {/* White card sheet — overlaps the hero slightly */}
      <div className="relative -mt-6 rounded-t-[40px] bg-background px-5 pt-6 pb-12 z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        {/* Identity */}
        <div className="flex flex-col items-center text-center gap-1 mb-5">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            {displayName}
            <BadgeCheck fill="#cb0028" stroke="white" />
          </h1>
          <p className="text-sm text-muted-foreground">{getTierLabel(tier)}</p>
        </div>

        {/* XP / Level pill */}
        <div className="flex justify-center mb-8">
          <XPLevelPill xp={xpTotal} level={level} />
        </div>

        {/* Badges section */}
        <section className="mb-8">
          <SectionHeader label={isOwnProfile ? t("profile.badges", "Mes badges") : "Badges"} href="#" />
          {badges.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {badges.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun badge pour l'instant.</p>
          )}
        </section>

        {/* Notebook section */}
        <section className={isOwnProfile ? "mb-8" : "mb-0"}>
          <SectionHeader label={isOwnProfile ? t("profile.notebook", "Mon carnet") : "Carnet"} href="#" />
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {MOCK_NOTEBOOK.map((entry) => (
              <NotebookCard key={entry.id} entry={entry} />
            ))}
          </div>
        </section>

        {/* QR Code — own profile only */}
        {isOwnProfile && (
          <section>
            <SectionHeader label={t("profile.qrcode", "Mon QR code")} />
            <div className="rounded-xl border border-border bg-card px-5 py-6 flex flex-col items-center">
              <QrCodeDisplay tier={tier} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
