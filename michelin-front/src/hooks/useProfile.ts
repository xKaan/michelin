import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { UserProfile, Badge, Streak, UserMascotWithOutfit, UserOutfit, Outfit } from "@/types/database";
import { resolveBuddyHead } from "@/hooks/useMascot";

export function useUserProfile(userId: string | null) {
  return useQuery<UserProfile | null>({
    queryKey: ["user-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [userRes, mascotRes] = await Promise.all([
        supabase
          .from("users")
          .select(`
            *,
            streak:streaks(*),
            badges(*)
          `)
          .eq("id", userId!)
          .maybeSingle(),
        supabase
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
          .maybeSingle()
      ]);

      if (userRes.error) throw userRes.error;
      if (!userRes.data) return null;

      const userData = userRes.data;
      const mascotData = mascotRes.data;

      let mascot: UserProfile["mascot"] = null;
      if (mascotData) {
        const equipped = ((mascotData.user_outfits ?? []) as (UserOutfit & { outfit: Outfit })[])
          .find((o) => o.is_equipped) ?? null;
        
        const mascotWithOutfit = { 
          ...mascotData, 
          user_outfits: undefined, 
          equipped_outfit: equipped,
        } as UserMascotWithOutfit;

        mascot = {
          ...mascotWithOutfit,
          head_url: resolveBuddyHead(mascotWithOutfit)
        };
      }

      return {
        ...userData,
        streak: (userData.streak as Streak[] | null)?.[0] ?? null,
        badges: (userData.badges as Badge[]) ?? [],
        mascot,
      } as UserProfile;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: {
      display_name?: string;
      phone?: string;
      avatar_color?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["user-profile", data.id] });
    },
  });
}
