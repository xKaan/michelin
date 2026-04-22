import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { UserMascotWithOutfit, UserOutfit, Outfit, Mascot } from "@/types/database";

function invalidateMascotQueries(qc: QueryClient, userId: string, userMascotId?: string) {
  if (userMascotId) qc.invalidateQueries({ queryKey: ["user-outfits", userMascotId] });
  qc.invalidateQueries({ queryKey: ["user-mascot", userId] });
  qc.invalidateQueries({ queryKey: ["user-mascots-all", userId] });
  qc.invalidateQueries({ queryKey: ["user-profile", userId] });
}

export function useUserMascot(userId: string | null) {
  return useQuery<UserMascotWithOutfit | null>({
    queryKey: ["user-mascot", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_mascots")
        .select(`
          *,
          mascot:mascots(*),
          user_outfits(
            *,
            outfit:outfits(*)
          )
        `)
        .eq("user_id", userId!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const equipped = ((data.user_outfits ?? []) as (UserOutfit & { outfit: Outfit })[])
        .find((o) => o.is_equipped) ?? null;

      const mascotWithOutfit = { 
        ...data, 
        user_outfits: undefined, 
        equipped_outfit: equipped 
      } as UserMascotWithOutfit;

      return { 
        ...mascotWithOutfit,
        head_url: resolveBuddyHead(mascotWithOutfit)
      } as UserMascotWithOutfit & { head_url: string };
    },
  });
}

export type UserMascotFull = UserMascotWithOutfit & {
  outfits: (UserOutfit & { outfit: Outfit })[];
  head_url: string;
};

export function useAllUserMascots(userId: string | null) {
  return useQuery<UserMascotFull[]>({
    queryKey: ["user-mascots-all", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_mascots")
        .select(`
          *,
          mascot:mascots(*),
          user_outfits(
            *,
            outfit:outfits(*)
          )
        `)
        .eq("user_id", userId!);
      if (error) throw error;

      return (data ?? [])
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((row) => {
          const outfits = ((row.user_outfits ?? []) as (UserOutfit & { outfit: Outfit })[])
            .sort((a, b) => a.id.localeCompare(b.id));
          
          const mascotWithOutfit = {
            ...row,
            user_outfits: undefined,
            equipped_outfit: outfits.find((o) => o.is_equipped) ?? null,
            outfits,
          } as UserMascotFull;

          return {
            ...mascotWithOutfit,
            head_url: resolveBuddyHead(mascotWithOutfit),
          } as UserMascotFull;
        });
    },
  });
}

export function useSetActiveMascot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, userMascotId }: { userId: string; userMascotId: string }) => {
      await supabase.from("user_mascots").update({ is_active: false }).eq("user_id", userId);
      const { data, error } = await supabase
        .from("user_mascots")
        .update({ is_active: true })
        .eq("id", userMascotId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { userId }) => invalidateMascotQueries(qc, userId),
  });
}

export function resolveMascotImage(row: { mascot: Mascot & { image_url?: string | null }; equipped_outfit: (UserOutfit & { outfit: Outfit }) | null }): string | undefined {
  return row.equipped_outfit?.outfit?.preview_url ?? row.mascot.image_url ?? undefined;
}

export function resolveBuddyImage(mascot: UserMascotWithOutfit | null | undefined): string | undefined {
  return mascot ? resolveMascotImage(mascot) : undefined;
}

export function resolveBuddyHead(mascot: (UserMascotWithOutfit & { mascot: Mascot & { head_url?: string | null } }) | null | undefined): string | undefined {
  if (!mascot) return undefined;
  return mascot.mascot.head_url ?? undefined;
}

export function useUserOutfits(userMascotId: string | null) {
  return useQuery({
    queryKey: ["user-outfits", userMascotId],
    enabled: !!userMascotId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_outfits")
        .select(`*, outfit:outfits(*)`)
        .eq("user_mascot_id", userMascotId!)
        .order("unlocked_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUnequipAllOutfits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userMascotId, userId }: { userMascotId: string; userId: string }) => {
      const { error } = await supabase
        .from("user_outfits")
        .update({ is_equipped: false })
        .eq("user_mascot_id", userMascotId);
      if (error) throw error;
      return { userMascotId, userId };
    },
    onSuccess: ({ userMascotId, userId }) => invalidateMascotQueries(qc, userId, userMascotId),
  });
}

export function useEquipOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userOutfitId, userMascotId, userId }: { userOutfitId: string; userMascotId: string; userId: string }) => {
      await supabase.from("user_outfits").update({ is_equipped: false }).eq("user_mascot_id", userMascotId);
      const { data, error } = await supabase
        .from("user_outfits")
        .update({ is_equipped: true })
        .eq("id", userOutfitId)
        .select()
        .single();
      if (error) throw error;
      return { ...data, userId };
    },
    onSuccess: (data) => invalidateMascotQueries(qc, data.userId, data.user_mascot_id),
  });
}
