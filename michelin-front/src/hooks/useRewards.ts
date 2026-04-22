import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Unlockable } from "@/types/database";

export interface Reward {
  id: string;
  establishment_id: string;
  name: string;
  description: string | null;
  reward_type: "drink" | "food" | "discount" | "other";
  min_tier: string;
  min_xp: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  created_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  checkin_id: string | null;
  status: "available" | "claimed" | "expired";
  unlocked_at: string;
  claimed_at: string | null;
  expires_at: string | null;
  // joined via user_available_rewards view
  name?: string;
  description?: string | null;
  reward_type?: string;
  min_tier?: string;
  establishment_name?: string;
  establishment_city?: string | null;
}

export function useEstablishmentUnlockables(establishmentId: string | null) {
  return useQuery<Unlockable[]>({
    queryKey: ["unlockables", establishmentId],
    enabled: !!establishmentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishment_unlockables")
        .select("*")
        .eq("establishment_id", establishmentId!);
      if (error) throw error;
      return (data ?? []) as Unlockable[];
    },
  });
}

export function useUserRewards(userId: string | null) {
  return useQuery<UserReward[]>({
    queryKey: ["user-rewards", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_available_rewards")
        .select("*")
        .eq("user_id", userId!)
        .order("unlocked_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UserReward[];
    },
  });
}

export function useClaimReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userRewardId: string) => {
      const { data, error } = await supabase
        .from("user_rewards")
        .update({ status: "claimed", claimed_at: new Date().toISOString() })
        .eq("id", userRewardId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-rewards"] });
    },
  });
}

export function useXpHistory(userId: string | null) {
  return useQuery({
    queryKey: ["xp-history", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xp_events")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useActiveQrCode(userId: string | null) {
  return useQuery({
    queryKey: ["active-qr", userId],
    enabled: !!userId,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_qr_codes")
        .select("*")
        .eq("user_id", userId!)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
