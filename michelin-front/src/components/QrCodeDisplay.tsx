import { QRCodeSVG } from "qrcode.react";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth, useGenerateQrCode } from "@/hooks/useAuth";
import { useActiveQrCode } from "@/hooks/useRewards";
import { cn } from "@/lib/utils";

const TIER_LABELS: Record<string, string> = {
  explorer: "Explorateur",
  member: "Membre",
  gourmet: "Gourmet",
  expert: "Expert",
};

const TIER_COLORS: Record<string, string> = {
  explorer: "text-muted-foreground border-border",
  member: "text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-700",
  gourmet: "text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700",
  expert: "text-primary border-primary/40",
};

interface QrCodeDisplayProps {
  tier?: string;
  className?: string;
}

export function QrCodeDisplay({ tier = "explorer", className }: QrCodeDisplayProps) {
  const { user } = useAuth();
  const { data: qrCode, isLoading } = useActiveQrCode(user?.id ?? null);
  const generate = useGenerateQrCode();
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, []);

  const expiresIn = qrCode && now
    ? Math.max(0, Math.floor((new Date(qrCode.expires_at).getTime() - now) / 60_000))
    : 0;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Badge de tier */}
      <div className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        TIER_COLORS[tier] ?? TIER_COLORS.explorer,
      )}>
        <Shield className="size-3.5" />
        {TIER_LABELS[tier] ?? tier}
      </div>

      {/* Zone QR */}
      <div className="relative rounded-2xl border border-border bg-white p-4 shadow-sm">
        {isLoading ? (
          <div className="size-48 animate-pulse rounded-xl bg-muted" />
        ) : qrCode ? (
          <QRCodeSVG
            value={qrCode.token}
            size={192}
            bgColor="#ffffff"
            fgColor="#1a1a1a"
            level="M"
          />
        ) : (
          <div className="flex size-48 flex-col items-center justify-center gap-3 rounded-xl bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">Aucun QR actif</p>
            <button
              onClick={() => generate.mutate()}
              disabled={generate.isPending}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Générer
            </button>
          </div>
        )}
      </div>

      {/* Footer : expiration */}
      {qrCode && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Expire dans {expiresIn} min</span>
        </div>
      )}

      <p className="max-w-56 text-center text-xs text-muted-foreground">
        Montre ce QR code au staff du restaurant pour valider ta visite.
      </p>
    </div>
  );
}
