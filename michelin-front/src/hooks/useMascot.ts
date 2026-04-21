import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { UserMascotWithOutfit, UserOutfit, Outfit } from "@/types/database";

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
          user_outfits!inner(
            *,
            outfit:outfits(*)
          )
        `)
        .eq("user_id", userId!)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const equipped = (data.user_outfits as (UserOutfit & { outfit: Outfit })[])
        .find((o) => o.is_equipped) ?? null;

      return {
        ...data,
        user_outfits: undefined,
        equipped_outfit: equipped,
      } as UserMascotWithOutfit;
    },
  });
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

export function useEquipOutfit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userOutfitId,
      userMascotId,
    }: {
      userOutfitId: string;
      userMascotId: string;
    }) => {
      // Déséquiper toutes les tenues du familier puis équiper la nouvelle
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
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["user-outfits", data.user_mascot_id] });
      qc.invalidateQueries({ queryKey: ["user-mascot"] });
    },
  });
}
