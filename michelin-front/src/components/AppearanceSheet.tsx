import { useState } from "react";
import { X, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useAllUserMascots,
  useSetActiveMascot,
  useEquipOutfit,
  useUnequipAllOutfits,
  resolveMascotImage,
  type UserMascotFull,
} from "@/hooks/useMascot";
import { cn } from "@/lib/utils";

interface AppearanceSheetProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "buddy" | "tenues";

export function AppearanceSheet({ open, onClose }: AppearanceSheetProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("buddy");
  const { data: mascots = [], isLoading } = useAllUserMascots(open ? (user?.id ?? null) : null);
  const setActive = useSetActiveMascot();
  const equipOutfit = useEquipOutfit();
  const unequipAll = useUnequipAllOutfits();

  const activeMascot = mascots.find((m) => m.is_active) ?? null;

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto rounded-t-[32px] bg-background shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-lg font-bold">Apparence</h2>
          <button
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex mx-5 mb-4 rounded-xl bg-muted p-1 gap-1">
          {(["buddy", "tenues"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {t === "buddy" ? "Familier" : "Tenues"}
            </button>
          ))}
        </div>

        <div className="px-5 pb-8 min-h-[260px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-sm text-muted-foreground animate-pulse">
              Chargement…
            </div>
          ) : tab === "buddy" ? (
            <BuddyTab
              mascots={mascots}
              activeMascotId={activeMascot?.id ?? null}
              onSelect={(m) => {
                if (!user || m.id === activeMascot?.id) return;
                setActive.mutate({ userId: user.id, userMascotId: m.id });
              }}
              isPending={setActive.isPending}
            />
          ) : (
            <TenuesTab
              activeMascot={activeMascot}
              onEquip={(userOutfitId, userMascotId) => {
                if (!user) return;
                equipOutfit.mutate({ userOutfitId, userMascotId, userId: user.id });
              }}
              onUnequip={(userMascotId) => {
                if (!user) return;
                unequipAll.mutate({ userMascotId, userId: user.id });
              }}
              isPending={equipOutfit.isPending || unequipAll.isPending}
            />
          )}
        </div>
      </div>
    </>
  );
}

// --- Shared card ---

function SelectionCard({
  img,
  label,
  isSelected,
  disabled,
  onClick,
}: {
  img: string | undefined;
  label: string;
  isSelected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 transition-colors disabled:opacity-60",
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      <img src={img} alt={label} className="h-20 w-auto object-contain" />
      <span className="text-xs font-medium text-center line-clamp-2">{label}</span>
      {isSelected && (
        <span className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="size-3 text-white stroke-[3]" />
        </span>
      )}
    </button>
  );
}

// --- Buddy tab ---

function BuddyTab({
  mascots,
  activeMascotId,
  onSelect,
  isPending,
}: {
  mascots: UserMascotFull[];
  activeMascotId: string | null;
  onSelect: (m: UserMascotFull) => void;
  isPending: boolean;
}) {
  if (mascots.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center mt-8">
        Aucun familier débloqué pour l'instant.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {mascots.map((m) => (
        <SelectionCard
          key={m.id}
          img={resolveMascotImage(m)}
          label={m.nickname ?? m.mascot.name}
          isSelected={m.id === activeMascotId}
          disabled={isPending}
          onClick={() => onSelect(m)}
        />
      ))}
    </div>
  );
}

// --- Tenues tab ---

function TenuesTab({
  activeMascot,
  onEquip,
  onUnequip,
  isPending,
}: {
  activeMascot: UserMascotFull | null;
  onEquip: (userOutfitId: string, userMascotId: string) => void;
  onUnequip: (userMascotId: string) => void;
  isPending: boolean;
}) {
  if (!activeMascot) {
    return (
      <p className="text-sm text-muted-foreground text-center mt-8">
        Sélectionne d'abord un familier.
      </p>
    );
  }

  const equippedId = activeMascot.equipped_outfit?.id ?? null;
  const baseImg = `/Buddy/${activeMascot.mascot.name}.png`;

  return (
    <div className="grid grid-cols-3 gap-3">
      <SelectionCard
        img={baseImg}
        label="Par défaut"
        isSelected={equippedId === null}
        disabled={isPending || equippedId === null}
        onClick={() => onUnequip(activeMascot.id)}
      />
      {activeMascot.outfits.map((uo) => (
        <SelectionCard
          key={uo.id}
          img={uo.outfit.preview_url ?? baseImg}
          label={uo.outfit.name}
          isSelected={uo.id === equippedId}
          disabled={isPending}
          onClick={() => onEquip(uo.id, activeMascot.id)}
        />
      ))}
    </div>
  );
}
