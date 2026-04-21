import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Review, ReviewWithMedia } from "@/types/database";

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
