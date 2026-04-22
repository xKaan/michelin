import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { UserMascotWithOutfit, UserOutfit, Outfit, Mascot } from "@/types/database";

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

      return {
        ...data,
        user_outfits: undefined,
        equipped_outfit: equipped,
      } as UserMascotWithOutfit;
    },
  });
}

export type UserMascotFull = UserMascotWithOutfit & {
  outfits: (UserOutfit & { outfit: Outfit })[];
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
        .eq("user_id", userId!)
        .order("unlocked_at", { ascending: true });
      if (error) throw error;

      return (data ?? [])
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((row) => {
        const outfits = ((row.user_outfits ?? []) as (UserOutfit & { outfit: Outfit })[])
          .sort((a, b) => a.id.localeCompare(b.id));
        const equipped = outfits.find((o) => o.is_equipped) ?? null;
        return {
          ...row,
          user_outfits: undefined,
          equipped_outfit: equipped,
          outfits,
        } as UserMascotFull;
      });
    },
  });
}

export function useSetActiveMascot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, userMascotId }: { userId: string; userMascotId: string }) => {
      await supabase
        .from("user_mascots")
        .update({ is_active: false })
        .eq("user_id", userId);

      const { data, error } = await supabase
        .from("user_mascots")
        .update({ is_active: true })
        .eq("id", userMascotId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { userId }) => {
      qc.invalidateQueries({ queryKey: ["user-mascot", userId] });
      qc.invalidateQueries({ queryKey: ["user-mascots-all", userId] });
    },
  });
}

/** Résout l'URL à afficher : tenue équipée si dispo, sinon buddy nu */
export function resolveBuddyImage(mascot: UserMascotWithOutfit | null | undefined): string | undefined {
  if (!mascot) return undefined;
  if (mascot.equipped_outfit?.outfit?.preview_url) {
    return mascot.equipped_outfit.outfit.preview_url;
  }
  return `/Buddy/${mascot.mascot.name}.png`;
}

export function resolveMascotImage(row: { mascot: Mascot; equipped_outfit: (UserOutfit & { outfit: Outfit }) | null }): string {
  return row.equipped_outfit?.outfit?.preview_url ?? `/Buddy/${row.mascot.name}.png`;
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
    onSuccess: ({ userMascotId, userId }) => {
      qc.invalidateQueries({ queryKey: ["user-outfits", userMascotId] });
      qc.invalidateQueries({ queryKey: ["user-mascot", userId] });
      qc.invalidateQueries({ queryKey: ["user-mascots-all", userId] });
    },
  });
}

export function useEquipOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userOutfitId,
      userMascotId,
      userId,
    }: {
      userOutfitId: string;
      userMascotId: string;
      userId: string;
    }) => {
      await supabase
        .from("user_outfits")
        .update({ is_equipped: false })
        .eq("user_mascot_id", userMascotId);

      const { data, error } = await supabase
        .from("user_outfits")
        .update({ is_equipped: true })
        .eq("id", userOutfitId)
        .select()
        .single();
      if (error) throw error;
      return { ...data, userId };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["user-outfits", data.user_mascot_id] });
      qc.invalidateQueries({ queryKey: ["user-mascot", data.userId] });
      qc.invalidateQueries({ queryKey: ["user-mascots-all", data.userId] });
    },
  });
}
