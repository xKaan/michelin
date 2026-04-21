import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { UserProfile, Badge, Streak } from "@/types/database";

export function useUserProfile(userId: string | null) {
  return useQuery<UserProfile | null>({
    queryKey: ["user-profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select(`
          *,
          streak:streaks(*),
          badges(*)
        `)
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;

      return {
        ...data,
        streak: (data.streak as Streak[] | null)?.[0] ?? null,
        badges: (data.badges as Badge[]) ?? [],
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
