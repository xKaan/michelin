import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { CriticReview, CriticType, Review, ReviewWithMedia } from "@/types/database";

export function useReviews(establishmentId: string | null) {
  return useQuery<ReviewWithMedia[]>({
    queryKey: ["reviews", establishmentId],
    enabled: !!establishmentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          media(*),
          user:users(id, display_name, tier)
        `)
        .eq("establishment_id", establishmentId!)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReviewWithMedia[];
    },
  });
}

export function useCriticReviews(
  establishmentId: string | null,
  criticType: CriticType,
) {
  return useQuery<CriticReview[]>({
    queryKey: ["critic-reviews", establishmentId, criticType],
    enabled: !!establishmentId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("critic_reviews")
        .select("*")
        .eq("establishment_id", establishmentId!)
        .eq("critic_type", criticType)
        .order("likes_count", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CriticReview[];
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      establishment_id: string;
      checkin_id: string;
      rating: number;
      content?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("reviews")
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Review;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["reviews", data.establishment_id] });
    },
  });
}
