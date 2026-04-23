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

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  reward_type: string;
  min_checkins: number;
  userRewardId: string | null;
  status: "available" | "claimed" | "expired" | null;
  claimed_at: string | null;
}

export function useEstablishmentLoyalty(userId: string | null, establishmentId: string | null) {
  return useQuery({
    queryKey: ["establishment-loyalty", userId, establishmentId],
    enabled: !!userId && !!establishmentId,
    queryFn: async () => {
      // 1. All loyalty rewards for this establishment
      const { data: rewards, error: rewardsErr } = await supabase
        .from("rewards")
        .select("id, name, description, reward_type, min_checkins")
        .eq("establishment_id", establishmentId!)
        .eq("is_active", true)
        .gt("min_checkins", 0)
        .order("min_checkins", { ascending: true });
      if (rewardsErr) throw rewardsErr;

      // 2. User's reward rows for these rewards (available + claimed)
      const rewardIds = (rewards ?? []).map((r) => r.id);
      let userRows: { id: string; reward_id: string; status: string; claimed_at: string | null }[] = [];
      if (rewardIds.length > 0) {
        const { data: ur, error: urErr } = await supabase
          .from("user_rewards")
          .select("id, reward_id, status, claimed_at")
          .eq("user_id", userId!)
          .in("reward_id", rewardIds);
        if (urErr) throw urErr;
        userRows = ur ?? [];
      }

      // 3. Visit count
      const { count } = await supabase
        .from("checkins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!)
        .eq("establishment_id", establishmentId!);

      const userMap = new Map(userRows.map((r) => [r.reward_id, r]));

      const combined: LoyaltyReward[] = (rewards ?? []).map((r) => {
        const ur = userMap.get(r.id) ?? null;
        return {
          id: r.id,
          name: r.name,
          description: r.description,
          reward_type: r.reward_type,
          min_checkins: r.min_checkins,
          userRewardId: ur?.id ?? null,
          status: (ur?.status as LoyaltyReward["status"]) ?? null,
          claimed_at: ur?.claimed_at ?? null,
        };
      });

      return { rewards: combined, visitCount: count ?? 0 };
    },
  });
}

export function useCheckinCount(userId: string | null, establishmentId: string | null) {
  return useQuery<number>({
    queryKey: ["checkin-count", userId, establishmentId],
    enabled: !!userId && !!establishmentId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("checkins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!)
        .eq("establishment_id", establishmentId!);
      if (error) throw error;
      return count ?? 0;
    },
  });
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
