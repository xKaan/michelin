import { cn } from "@/lib/utils";

interface TierConfig {
  label: string;
  min: number;
  max: number;
  color: string;
  bg: string;
}

const TIERS: TierConfig[] = [
  { label: "Explorateur", min: 0,    max: 499,  color: "text-muted-foreground", bg: "bg-muted-foreground" },
  { label: "Membre",      min: 500,  max: 1999, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500" },
  { label: "Gourmet",     min: 2000, max: 4999, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500" },
  { label: "Expert",      min: 5000, max: Infinity, color: "text-primary", bg: "bg-primary" },
];

const XP_ACTIONS: Record<string, number> = {
  checkin: 50,
  review: 100,
  photo: 30,
  like: 10,
  streak_bonus: 100,
};

function getTierConfig(xp: number): TierConfig {
  return TIERS.findLast((t) => xp >= t.min) ?? TIERS[0];
}

function getNextTier(xp: number): TierConfig | null {
  return TIERS.find((t) => t.min > xp) ?? null;
}

interface XpProgressProps {
  xp: number;
  streak?: number;
  className?: string;
  showActions?: boolean;
}

export function XpProgress({ xp, streak, className, showActions = false }: XpProgressProps) {
  const current = getTierConfig(xp);
  const next = getNextTier(xp);

  const progress = next
    ? Math.round(((xp - current.min) / (next.min - current.min)) * 100)
    : 100;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Tier actuel + XP */}
      <div className="flex items-end justify-between">
        <div>
          <p className={cn("text-xs font-semibold uppercase tracking-widest", current.color)}>
            {current.label}
          </p>
          <p className="text-2xl font-bold tabular-nums">{xp.toLocaleString()} XP</p>
        </div>
        {streak !== undefined && streak > 0 && (
          <div className="flex flex-col items-end">
            <span className="text-lg font-bold">{streak}</span>
            <span className="text-xs text-muted-foreground">jours streak</span>
          </div>
        )}
      </div>

      {/* Barre de progression */}
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700", current.bg)}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Prochain palier */}
      {next ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{current.label}</span>
          <span>
            {(next.min - xp).toLocaleString()} XP avant <strong>{next.label}</strong>
          </span>
        </div>
      ) : (
        <p className="text-xs text-primary">Rang maximum atteint</p>
      )}

      {/* Actions XP (optionnel) */}
      {showActions && (
        <div className="mt-1 grid grid-cols-2 gap-2">
          {Object.entries(XP_ACTIONS).map(([action, pts]) => (
            <div
              key={action}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs"
            >
              <span className="capitalize text-muted-foreground">{ACTION_LABELS[action] ?? action}</span>
              <span className="font-semibold text-primary">+{pts}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ACTION_LABELS: Record<string, string> = {
  checkin: "Check-in",
  review: "Avis",
  photo: "Photo",
  like: "Like reçu",
  streak_bonus: "Streak ×7",
};
